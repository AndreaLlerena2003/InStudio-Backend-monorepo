import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { SNSClient, SubscribeCommand, PublishCommand } from "@aws-sdk/client-sns";
import * as dotenv from 'dotenv';
import { NotificationRepository } from '../app/notification/notification.repository';
import { CreateNotificationDto } from '../app/dto/notification.dto';
import { SetSubscriptionAttributesCommand } from "@aws-sdk/client-sns";
import { ClientKafka } from '@nestjs/microservices';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { firstValueFrom } from 'rxjs';

dotenv.config();

@Injectable()
export class NotificationManager implements OnModuleInit {
  protected config: { maxAttempts: number };
  protected sns_client: SNSClient;

  constructor(
    protected readonly notificationRepository: NotificationRepository,
    @Inject('user-client') protected readonly kafkaClient: ClientKafka,
  ) {
    this.config = { maxAttempts: 3 };
    this.sns_client = new SNSClient({
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
      region: 'us-east-2',
      ...this.config
    });
  }
  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('get-username-for-notification');
    await this.kafkaClient.connect();
  }
  private async getSalonName(beautySalonId: string): Promise<string> {
    /*// Llamar al microservicio de salón para obtener el nombre del salón
    Logger.log("Entrou no getSalonName");
    const salonName = await firstValueFrom(
      this.kafkaClient.send('get-salon-name-for-notification', { beautySalonId }),
    );*/
    const salonName = "Salon Name";
    return salonName;
  }
  private async getUsername(userId: string): Promise<string> {
    // Llamar al microservicio de usuario para obtener el nombre de usuario
    /*Logger.log("Entrou no getUsername");
    const username = await firstValueFrom(
      this.kafkaClient.send('get-username-for-notification', { userId }),
    );*/
    const username= "User Name";
    return username;
  }

  validateInput(userId: string, email: string, typeToBehavior: string) {
    if (!userId || typeof userId !== 'string') {
        throw new Error("Invalid UserID (username)");
    }
    if (!email || !email.includes("@")) {
        throw new Error("Invalid Email Address");
    }
    if (!['Subscription', 'Reminder', 'Offer'].includes(typeToBehavior)) {
        throw new Error("Invalid TypeBehavior");
    }
  }

  async updateNotifications(user_id: string, email: string, type_to_behavior: string, beauty_salon_id?: string, date?: string, time?: string, service?: string, offer_id?: string, description?: string, reminder_id?: string) {
    try {
      const notificationDto = new CreateNotificationDto();
      notificationDto.userId = user_id;
      notificationDto.Email = email; // Usar solo Email
      notificationDto.typeBehavior = type_to_behavior as 'Subscription' | 'Reminder' | 'Offer';
      notificationDto.beautySalonId = beauty_salon_id;
      // Añadir los siguientes dos campos
      notificationDto.username = await this.getUsername(user_id);
      notificationDto.salonName = await this.getSalonName(beauty_salon_id);
      notificationDto.date = date;
      notificationDto.time = time;
      notificationDto.service = service;
      notificationDto.offerId = offer_id;
      notificationDto.description = description;
      notificationDto.reminderId = reminder_id;

      await this.notificationRepository.create(notificationDto);
      Logger.log("Notification updated successfully.");
    } catch (error) {
      Logger.log(`Error updating notification: ${error}`);
      throw error;
    }
  }

  async setSubscriptionAttributes(subscriptionArn: string, attributeName: string, attributeValue: string | number | boolean | object) {
    try {
      const command = new SetSubscriptionAttributesCommand({
        SubscriptionArn: subscriptionArn,
        AttributeName: attributeName,
        AttributeValue: JSON.stringify(attributeValue), 
      });
  
      const response = await this.sns_client.send(command);
  
      Logger.log(`✅ Subscription attribute "${attributeName}" set successfully for ${subscriptionArn}`);
      return response;
    } catch (error) {
      Logger.log(`❌ Error setting subscription attribute "${attributeName}" for ${subscriptionArn}: ${error.message}`);
      throw error;
    }
  }

  async setFilterPolicy(subscriptionArn: string, filterPolicy: Record<string, string | number | boolean>) {
    try {
      const params = {
        SubscriptionArn: subscriptionArn,
        AttributeName: 'FilterPolicy',
        AttributeValue: JSON.stringify(filterPolicy),
      };
      const command = new SetSubscriptionAttributesCommand(params);
      await this.sns_client.send(command);
      Logger.log(`✅ Filter policy set for subscription: ${subscriptionArn}`);
    } catch (error) {
      Logger.log(`❌ Error setting filter policy: ${error.message}`);
      throw error;
    }
  }
  

  async subscribeToSnsTopic(email: string, filterPolicy: Record<string, string | number | boolean>) {
    try {
      const command = new SubscribeCommand({
        TopicArn: process.env.ARN,
        Protocol: 'email',
        Endpoint: email,
      });
  
      const response = await this.sns_client.send(command);
  
      // Configurar el filtro inmediatamente después de crear la suscripción
      const subscriptionArn = response.SubscriptionArn;
      await this.setFilterPolicy(subscriptionArn, filterPolicy);
  
      return response;
    } catch (error) {
      Logger.log(`❌ Error subscribing to SNS topic: ${error.message}`);
      throw error;
    }
  }
  

  async sendOfferNotification(userId: string, email: string, description: string, beauty_salon_id?: string) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            // Recuperar la notificación almacenada para obtener username y salonName
            const notifications = await this.notificationRepository.findByUserAndType(userId, 'Offer');
            
            //const notification = notifications[0];
            //const beauty_salon_id = notification.BeautySalonID;
            const username = "notification.username";       // Usar 'username'
            const salonName = "notification.salonName";   // Usar 'salonName'

            const subject = "Nueva Oferta disponible";
            const body = `Hola ${username},\n\n El local ${salonName} tiene una nueva oferta: ${description}.`;
            const command = new PublishCommand({
                TopicArn: process.env.ARN,
                Message: body,
                Subject: subject,
                MessageAttributes: {
                    'email': {
                        DataType: 'String',
                        StringValue: email
                    },
                    'typeBehavior': { // Nuevo atributo para filtrado
                        DataType: 'String',
                        StringValue: 'Offer'
                    }
                }
            });
            const response = await this.sns_client.send(command);
            // Actualizar el estado a 'Sent' después de enviar la notificación
            await this.updateNotificationStatus(userId, 'Offer', beauty_salon_id, 'Sent');
            Logger.log(`Offer notification sent to ${username} and status updated.`);
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando oferta (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                // Actualizar el estado a 'Error' si hubo una excepción
                //await this.updateNotificationStatus(userId, 'Offer', beauty_salon_id, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async sendReminderNotification(email: string, userId: string,date: string, timeStr: string, service: string, beauty_salon_id?: string) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            // Recuperar la notificación almacenada para obtener username y salonName
            Logger.log(`\n🔍 Buscando notificación pendiente para ${userId}...`);
            //const notifications = await this.notificationRepository.findByUserAndType(userId, 'Reminder');

            /*const notification = notifications[0];
            const beauty_salon_id = notification.beautySalonId; */
            const username = "notification.username;   "  ;  // Usar 'username'
            const salonName = "notification.salonName;";   // Usar 'salonName'

            Logger.log(`\n📤 Enviando recordatorio a ${email}:`);
            Logger.log(`- Salón: ${salonName}`);
            Logger.log(`- Fecha: ${date}`);
            Logger.log(`- Hora: ${timeStr}`);
            
            const subject = "Recordatorio de Cita";
            const body = `Hola ${username},\n\n Este es un recordatorio de que tienes una cita en el local ${salonName} el ${date} a las ${timeStr} para ${service}.`;
            
            const command = new PublishCommand({
                TopicArn: process.env.ARN,
                Message: body,
                Subject: subject,
                MessageAttributes: {
                    'email': {
                        DataType: 'String',
                        StringValue: email
                    },
                    'typeBehavior': { // Nuevo atributo para filtrado
                        DataType: 'String',
                        StringValue: 'Reminder'
                    }
                }
            });
            const response = await this.sns_client.send(command);
            Logger.log("✅ Notificación SNS enviada exitosamente");
            Logger.log(`- MessageId: ${response.MessageId}`);
            
            Logger.log("\n🔄 Actualizando estado en DynamoDB...");
            await this.updateNotificationStatus(userId, 'Reminder', beauty_salon_id, 'Sent');
            
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando recordatorio (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                Logger.log("❌ Se alcanzó el número máximo de reintentos para enviar el recordatorio.");
                //await this.updateNotificationStatus(userId, 'Reminder', beauty_salon_id, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async updateNotificationStatus(userId: string, typeToBehavior: string, beautySalonId: string, status: 'Pending' | 'Sent' | 'Error') {
    try {
      await this.notificationRepository.updateStatus(userId, typeToBehavior, beautySalonId, status);
      Logger.log(`✅ Estado actualizado exitosamente a '${status}'`);
    } catch (error) {
      Logger.log(`❌ Error actualizando estado: ${error}`);
      throw error;
    }
  }

  async sendUnsubscriptionNotification(email: string, userId: string, beautySalonId: string) {
    try {
        const subject = "Confirmación de Desuscripción";
        const body = `Hola ${userId},\n\n Te has desuscrito exitosamente del salon de belleza ${beautySalonId}.`;
        const command = new PublishCommand({
            TopicArn: process.env.ARN,
            Message: body,
            Subject: subject,
            MessageAttributes: {
                'email': {
                    DataType: 'String',
                    StringValue: email
                },
                'typeBehavior': { // Nuevo atributo para filtrado
                    DataType: 'String',
                    StringValue: 'Unsubscription'
                }
            }
        });
        const response = await this.sns_client.send(command);
        return response;
    } catch (error) {
        return {"status": "error", "message": error.message};
    }
  }

  async sendOfferNotificationToAllFollowers(beautySalonId: string, description: string) {
    try {
      const followers = await this.notificationRepository.getFollowers(beautySalonId);

      for (const follower of followers) {
        const user_id = follower.UserID_TypeBehavior_BeautySalonID.split('#')[0];
        await this.sendOfferNotification(user_id, follower.Email, description);
      }

      return { status: "success", message: "Notifications sent to all active followers" };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  }

  async get_recent_notifications_by_type_and_salon(type_behavior: string, beauty_salon_id: string) {
    try {
      const notifications = await this.notificationRepository.getRecentNotifications(type_behavior, beauty_salon_id);

      Logger.log(`Encontradas ${notifications.length} notificaciones Pendings de tipo ${type_behavior}`);
      return notifications;
    } catch (error) {
      Logger.log(`Error getting recent notifications: ${error}`);
      return [];
    }
  }

  async get_user_id_by_email(email: string) {
    try {
      const user_id = await this.notificationRepository.getUserIdByEmail(email);
      return user_id;
    } catch (error) {
      Logger.log(`Error getting user_id for email ${email}: ${error}`);
      return null;
    }
  }
}
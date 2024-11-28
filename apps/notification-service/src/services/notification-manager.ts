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
export class NotificationManager {
  protected config: { maxAttempts: number };
  protected sns_client: SNSClient;

  constructor(
    protected readonly notificationRepository: NotificationRepository,
   //@Inject('user-client') protected readonly kafkaClient: ClientKafka,
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
  /*async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('get-UserName-for-notification');
    await this.kafkaClient.connect();
  }*/
  private async getSalonName(BeautySalonID: string): Promise<string> {
    /*// Llamar al microservicio de salón para obtener el nombre del salón
    Logger.log("Entrou no getSalonName");
    const SalonName = await firstValueFrom(
      this.kafkaClient.send('get-salon-name-for-notification', { BeautySalonID }),
    );*/
    const SalonName = "Salon Name";
    return SalonName;
  }
  private async getUsername(UserId: string): Promise<string> {
    // Llamar al microservicio de usuario para obtener el nombre de usuario
    /*Logger.log("Entrou no getUsername");
    const UserName = await firstValueFrom(
      this.kafkaClient.send('get-UserName-for-notification', { UserId }),
    );*/
    const UserName= "User Name";
    return UserName;
  }

  validateInput(UserId: string, email: string, typeToBehavior: string) {
    if (!UserId || typeof UserId !== 'string') {
        throw new Error("Invalid UserID (UserName)");
    }
    if (!email || !email.includes("@")) {
        throw new Error("Invalid Email Address");
    }
    if (!['Subscription', 'Reminder', 'Offer'].includes(typeToBehavior)) {
        throw new Error("Invalid TypeBehavior");
    }
  }

  async updateNotifications(user_id: string, email: string, type_to_behavior: string, BeautySalonID?: string, Date?: string, Time?: string, Service?: string, OfferID?: string, Description?: string, ReminderID?: string) {
    try {
      const notificationDto = new CreateNotificationDto();
      notificationDto.UserId = user_id;
      notificationDto.Email = email; // Usar solo Email
      notificationDto.TypeBehavior = type_to_behavior as 'Subscription' | 'Reminder' | 'Offer';
      notificationDto.BeautySalonID = BeautySalonID;
      // Añadir los siguientes dos campos
      notificationDto.UserName = "UserName"; //await this.getUsername(user_id);
      notificationDto.SalonName = "salonname";//await this.getSalonName(BeautySalonID);
      notificationDto.Date = Date;
      notificationDto.Time = Time;
      notificationDto.Service = Service;
      notificationDto.OfferID = OfferID;
      notificationDto.Description = Description;
      notificationDto.ReminderID = ReminderID;
      Logger.log("por update")
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
  

  async sendOfferNotification(UserId: string, email: string, Description: string, BeautySalonID?: string) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            // Recuperar la notificación almacenada para obtener UserName y SalonName
            /*const notifications = await this.notificationRepository.findByUserAndType(UserId, 'Offer');*/
            
            //const notification = notifications[0];
            //const BeautySalonID = notification.;
            const UserName = "notification.UserName";       // Usar 'UserName'
            const SalonName = "notification.SalonName";   // Usar 'SalonName'

            const subject = "Nueva Oferta disponible";
            const body = `Hola ${UserName},\n\n El local ${SalonName} tiene una nueva oferta: ${Description}.`;
            const command = new PublishCommand({
                TopicArn: process.env.ARN,
                Message: body,
                Subject: subject,
                MessageAttributes: {
                    'email': {
                        DataType: 'String',
                        StringValue: email
                    },
                    'TypeBehavior': { // Nuevo atributo para filtrado
                        DataType: 'String',
                        StringValue: 'Offer'
                    }
                }
            });
            const response = await this.sns_client.send(command);
            // Actualizar el estado a 'Sent' después de enviar la notificación
            await this.updateNotificationStatus(UserId, 'Offer', BeautySalonID, 'Sent');
            Logger.log(`Offer notification sent to ${UserName} and status updated.`);
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando oferta (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                // Actualizar el estado a 'Error' si hubo una excepción
                //await this.updateNotificationStatus(UserId, 'Offer', BeautySalonID, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async sendReminderNotification(email: string, UserId: string, Date: string, Time: string, Service: string, BeautySalonID?: string) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            // Recuperar la notificación almacenada para obtener UserName y SalonName
            Logger.log(`\n🔍 Buscando notificación pendiente para ${UserId}...`);
            //const notifications = await this.notificationRepository.findByUserAndType(UserId, 'Reminder');

            /*const notification = notifications[0];
            const BeautySalonID = notification.BeautySalonID; */
            const UserName = "notification.UserName;   "  ;  // Usar 'UserName'
            const SalonName = "notification.SalonName;";   // Usar 'SalonName'

            Logger.log(`\n📤 Enviando recordatorio a ${email}:`);
            Logger.log(`- Salón: ${SalonName}`);
            Logger.log(`- Fecha: ${Date}`);
            Logger.log(`- Hora: ${Time}`);
            
            const subject = "Recordatorio de Cita";
            const body = `Hola ${UserName},\n\n Este es un recordatorio de que tienes una cita en el local ${SalonName} el ${Date} a las ${Time} para ${Service}.`;
            
            const command = new PublishCommand({
                TopicArn: process.env.ARN,
                Message: body,
                Subject: subject,
                MessageAttributes: {
                    'email': {
                        DataType: 'String',
                        StringValue: email
                    },
                    'TypeBehavior': { // Nuevo atributo para filtrado
                        DataType: 'String',
                        StringValue: 'Reminder'
                    }
                }
            });
            const response = await this.sns_client.send(command);
            Logger.log("✅ Notificación SNS enviada exitosamente");
            Logger.log(`- MessageId: ${response.MessageId}`);
            
            Logger.log("\n🔄 Actualizando estado en DynamoDB...");
            await this.updateNotificationStatus(UserId, 'Reminder', BeautySalonID, 'Sent');
            
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando recordatorio (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                Logger.log("❌ Se alcanzó el número máximo de reintentos para enviar el recordatorio.");
                //await this.updateNotificationStatus(UserId, 'Reminder', BeautySalonID, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async updateNotificationStatus(UserId: string, typeToBehavior: string, BeautySalonID: string, status: 'Pending' | 'Sent' | 'Error') {
    try {
      await this.notificationRepository.updateStatus(UserId, typeToBehavior, BeautySalonID, status);
      Logger.log(`✅ Estado actualizado exitosamente a '${status}'`);
    } catch (error) {
      Logger.log(`❌ Error actualizando estado: ${error}`);
      throw error;
    }
  }

  async sendUnsubscriptionNotification(email: string, UserId: string, BeautySalonID: string) {
    try {
        const subject = "Confirmación de Desuscripción";
        const body = `Hola ${UserId},\n\n Te has desuscrito exitosamente del salon de belleza ${BeautySalonID}.`;
        const command = new PublishCommand({
            TopicArn: process.env.ARN,
            Message: body,
            Subject: subject,
            MessageAttributes: {
                'email': {
                    DataType: 'String',
                    StringValue: email
                },
                'TypeBehavior': { // Nuevo atributo para filtrado
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

  async sendOfferNotificationToAllFollowers(BeautySalonID: string, Description: string) {
    try {
      const followers = await this.notificationRepository.getFollowers(BeautySalonID);

      for (const follower of followers) {
        const user_id = follower.UserID_TypeBehavior_BeautySalonID.split('#')[0];
        await this.sendOfferNotification(user_id, follower.Email, Description);
      }

      return { status: "success", message: "Notifications sent to all Active followers" };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  }

  async get_recent_notifications_by_type_and_salon(type_behavior: string, BeautySalonID: string) {
    try {
      const notifications = await this.notificationRepository.getRecentNotifications(type_behavior, BeautySalonID);

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
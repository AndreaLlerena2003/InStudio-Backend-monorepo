import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, SubscribeCommand, PublishCommand } from "@aws-sdk/client-sns";
import * as dotenv from 'dotenv';
import { NotificationRepository } from '../app/notification/notification.repository'; // Removido INotification
import { CreateNotificationDto } from '../app/dto/notification.dto';
import { SetSubscriptionAttributesCommand } from "@aws-sdk/client-sns";


dotenv.config();

@Injectable()
export class NotificationManager {
  // Remover decorador WebSocketGateway y server property
  protected config: { maxAttempts: number };
  protected sns_client: SNSClient;

  constructor(
    protected readonly notificationRepository: NotificationRepository
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

  validate_input(user_id, email, type_to_behavior) {
    if (!user_id || typeof user_id !== 'string') {
        throw new Error("Invalid UserID (username)");
    }
    if (!email || !email.includes("@")) {
        throw new Error("Invalid Email Address");
    }
    if (!['Subscription', 'Reminder', 'Offer'].includes(type_to_behavior)) {
        throw new Error("Invalid TypeBehavior");
    }
  }

  async updateNotifications(user_id: string, email: string, type_to_behavior: string, beauty_salon_id?: string, date?: string, time?: string, service?: string, offer_id?: string, description?: string, reminder_id?: string) {
    try {
      const notificationDto = new CreateNotificationDto();
      notificationDto.userId = user_id;
      notificationDto.email = email;
      notificationDto.typeBehavior = type_to_behavior as 'Subscription' | 'Reminder' | 'Offer';
      notificationDto.beautySalonId = beauty_salon_id;
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
        AttributeValue: JSON.stringify(attributeValue), // Convierte el valor a JSON si es necesario (como en el caso de FilterPolicy)
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
  

  async subscribe_to_sns_topic(email: string, filterPolicy: Record<string, string | number | boolean>) {
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
  

  async send_offer_notification(user_id, email, beauty_salon_id, offer_id, description) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            const subject = "New Offer Available";
            const body = `Hello ${user_id},\n\nBeauty salon ${beauty_salon_id} has a new offer: ${description}.`;
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
            // Actualizar el estado a 'Enviado' después de enviar la notificación
            await this.updateNotificationStatus(user_id, 'Offer', beauty_salon_id, 'Enviado');
            Logger.log(`Offer notification sent to ${user_id} and status updated.`);
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando oferta (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                // Actualizar el estado a 'Error' si hubo una excepción
                await this.updateNotificationStatus(user_id, 'Offer', beauty_salon_id, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async send_reminder_notification(email, user_id, beauty_salon_id, date, time_str, service) {
    const max_retries = 3;
    const retry_delay = 2;  // segundos
    let attempt = 0;
    while (attempt < max_retries) {
        try {
            Logger.log(`\n📤 Enviando recordatorio a ${email}:`);
            Logger.log(`- Salón: ${beauty_salon_id}`);
            Logger.log(`- Fecha: ${date}`);
            Logger.log(`- Hora: ${time_str}`);
            
            const subject = "Appointment Reminder";
            const body = `Hello ${user_id},\n\nThis is a reminder for your appointment at beauty salon ${beauty_salon_id} on ${date} at ${time_str} for ${service}.`;
            
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
            await this.updateNotificationStatus(user_id, 'Reminder', beauty_salon_id, 'Enviado');
            
            return response;
        } catch (error) {
            attempt += 1;
            Logger.log(`❌ Error enviando recordatorio (Intento ${attempt}/${max_retries}): ${error}`);
            if (attempt < max_retries) {
                Logger.log(`🔄 Volviendo a intentar en ${retry_delay} segundos...`);
                await new Promise(resolve => setTimeout(resolve, retry_delay * 1000));
            } else {
                Logger.log("❌ Se alcanzó el número máximo de reintentos para enviar el recordatorio.");
                await this.updateNotificationStatus(user_id, 'Reminder', beauty_salon_id, 'Error');
                return {"status": "error", "message": error.message};
            }
        }
    }
  }

  async updateNotificationStatus(user_id: string, type_to_behavior: string, beauty_salon_id: string, status: 'Pendiente' | 'Enviado' | 'Error') {
    try {
      await this.notificationRepository.updateStatus(user_id, type_to_behavior, beauty_salon_id, status);
      Logger.log(`✅ Estado actualizado exitosamente a '${status}'`);
    } catch (error) {
      Logger.log(`❌ Error actualizando estado: ${error}`);
      throw error;
    }
  }

  async send_unsubscription_notification(email, user_id, beauty_salon_id) {
    try {
        const subject = "Unsubscription Confirmation";
        const body = `Hello ${user_id},\n\nYou have successfully unsubscribed from beauty salon ${beauty_salon_id}.`;
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

  async send_offer_notification_to_all_followers(beauty_salon_id: string, offer_id: string, description: string) {
    try {
      const followers = await this.notificationRepository.getFollowers(beauty_salon_id);

      for (const follower of followers) {
        const user_id = follower.UserID_TypeBehavior_BeautySalonID.split('#')[0];
        await this.send_offer_notification(user_id, follower.Email, beauty_salon_id, offer_id, description);
      }

      return { status: "success", message: "Notifications sent to all active followers" };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  }

  async get_recent_notifications_by_type_and_salon(type_behavior: string, beauty_salon_id: string) {
    try {
      const notifications = await this.notificationRepository.getRecentNotifications(type_behavior, beauty_salon_id);

      Logger.log(`Encontradas ${notifications.length} notificaciones pendientes de tipo ${type_behavior}`);
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
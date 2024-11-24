import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import { Model } from 'dynamoose/dist/Model';
import { Notification } from '@backend-in-studio/dynamoose-manager';
import { CreateNotificationDto } from '../dto/notification.dto';


export type INotification = {
  UserID_TypeBehavior_BeautySalonID: string;
  Timestamp: string;
  Email: string;
  TypeBehavior: 'Subscription' | 'Reminder' | 'Offer';
  BeautySalonID: string;
  Active: boolean;
  Status: 'Pendiente' | 'Enviado' | 'Error';
  Date?: string;
  Time?: string;
  Service?: string;
  ReminderID?: string;
  OfferID?: string;
  Description?: string;
};

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectModel('Notification')
    private notificationModel: Model<Notification>
  ) {}

  async create(notificationDto: CreateNotificationDto): Promise<INotification> {
    const timestamp = new Date().toISOString();
    const userKey = `${notificationDto.userId}#${notificationDto.typeBehavior}#${notificationDto.beautySalonId}`;

    const notificationData: INotification = {
      UserID_TypeBehavior_BeautySalonID: userKey,
      Timestamp: timestamp,
      Email: notificationDto.email,
      TypeBehavior: notificationDto.typeBehavior,
      BeautySalonID: notificationDto.beautySalonId,
      Active: notificationDto.active,
      Status: notificationDto.status,
      Date: notificationDto.date,
      Time: notificationDto.time,
      Service: notificationDto.service,
      ReminderID: notificationDto.reminderId,
      OfferID: notificationDto.offerId,
      Description: notificationDto.description
    };

    return this.notificationModel.create(notificationData);
  }

  async findByUserAndType(userId: string, type: string) {
    return this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .beginsWith(`${userId}#${type}`)
      .exec();
  }

  async updateStatus(user_id: string, type_to_behavior: string, beauty_salon_id: string, status: 'Pendiente' | 'Enviado' | 'Error') {
    const user_key = `${user_id}#${type_to_behavior}#${beauty_salon_id}`;
    const [notification] = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .eq(user_key)
      .sort('descending')
      .limit(1)
      .exec();

    if (notification) {
      await this.notificationModel.update({
        UserID_TypeBehavior_BeautySalonID: user_key,
        Timestamp: notification.Timestamp
      }, {
        Status: status
      });
    } else {
      this.logger.warn(`No se encontró la notificación para actualizar`);
    }
  }

  async findRecentByTypeAndSalon(type_behavior: string, beauty_salon_id: string) {
    return this.notificationModel
      .query('TypeBehavior')
      .eq(type_behavior)
      .where('BeautySalonID')
      .eq(beauty_salon_id)
      .filter('Status')
      .eq('Pendiente')
      .and()
      .filter('Active')
      .eq(true)
      .using('TypeBehavior-BeautySalonID-index')
      .exec();
  }

  async getFollowers(beauty_salon_id: string) {
    return this.notificationModel
      .query('TypeBehavior')
      .eq('Subscription')
      .where('BeautySalonID')
      .eq(beauty_salon_id)
      .filter('Active')
      .eq(true)
      .exec();
  }

  async getRecentNotifications(type_behavior: string, beauty_salon_id: string) {
    return this.notificationModel
      .query('TypeBehavior')
      .eq(type_behavior)
      .where('BeautySalonID')
      .eq(beauty_salon_id)
      .filter('Status')
      .eq('Pendiente')
      .and()
      .filter('Active')
      .eq(true)
      .using('TypeBehavior-BeautySalonID-index')
      .sort('descending')
      .limit(10)
      .exec();
  }

  async getUserIdByEmail(email: string) {
    const [notification] = await this.notificationModel
      .scan('Email')
      .eq(email)
      .limit(1)
      .exec();

    if (notification) {
      // El UserID es la primera parte del UserID_TypeBehavior_BeautySalonID
      return notification.UserID_TypeBehavior_BeautySalonID.split('#')[0];
    }
    
    this.logger.warn(`No se encontró usuario con el email: ${email}`);
    return null;
  }
}
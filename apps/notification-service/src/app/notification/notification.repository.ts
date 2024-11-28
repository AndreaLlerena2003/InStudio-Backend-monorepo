import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import { Model } from 'dynamoose/dist/Model';
import { Notification } from '@backend-in-studio/dynamoose-manager';
import { CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationRepository {
  private readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectModel('Notification')
    private notificationModel: Model<Notification>
  ) {}

  async create(notificationDto: CreateNotificationDto): Promise<Notification> {
    const timestamp = new Date().toISOString();
    const userKey = `${notificationDto.userId}#${notificationDto.typeBehavior}#${notificationDto.beautySalonId}`;

    const notificationData: CreateNotificationDto = {
      UserID_TypeBehavior_BeautySalonID: userKey,
      userId: notificationDto.userId,
      Timestamp: timestamp,
      Email: notificationDto.Email, // Usar solo Email
      typeBehavior: notificationDto.typeBehavior,
      beautySalonId: notificationDto.beautySalonId,
      active: notificationDto.active,
      status: notificationDto.status,
      date: notificationDto.date,
      time: notificationDto.time,
      service: notificationDto.service,
      reminderId: notificationDto.reminderId,
      offerId: notificationDto.offerId,
      description: notificationDto.description,
      username: notificationDto.username,
      salonName: notificationDto.salonName
    };

    return this.notificationModel.create(notificationData);
  }

  async findByUserAndType(userId: string, type: string): Promise<Notification[]> {
    const notifications = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .beginsWith(`${userId}#${type}`)
      .exec();
    Logger.log(`Notificaciones encontradas: ${notifications.length}`);
    // Añadir username y salonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const [_, typeBehavior, beautySalonId] = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      const userData = { username: "notification.username", salonName: "notification.salonName" };
      /*await this.getUserNameAndSalonname(userId, typeBehavior, beautySalonId);*/
      return {
        ...notification,
        username: userData?.username || notification.username,
        salonName: userData?.salonName || notification.salonName,
      };
    }));

    return enrichedNotifications as Notification[];
  }

  async updateStatus(user_id: string, type_to_behavior: string, beauty_salon_id: string, status: 'Pending' | 'Sent' | 'Error') {
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
      .eq('Pending')
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
    const notifications = await this.notificationModel
      .query('TypeBehavior')
      .eq(type_behavior)
      .where('BeautySalonID')
      .eq(beauty_salon_id)
      .filter('Status')
      .eq('Pending')
      .and()
      .filter('Active')
      .eq(true)
      .using('TypeBehavior-BeautySalonID-index')
      .sort('descending')
      .limit(10)
      .exec();

    // Añadir username y salonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const userKeyParts = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      const userId = userKeyParts[0];
      const typeBehavior = userKeyParts[1];
      const beautySalonId = userKeyParts[2];
      const userData = {
        username: "notification.username",
        salonName: "notification.salon"
      }
      /*await this.getUserNameAndSalonname(userId, typeBehavior, beautySalonId);*/
      return {
        ...notification,
        username: userData?.username || notification.username,
        salonName: userData?.salonName || notification.salonName,
      };
    }));

    return enrichedNotifications;
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

  async getRecentNotificationsForUser(userId: string): Promise<CreateNotificationDto[]> {
    const notifications = await this.notificationModel
      .query('UserId')
      .eq(userId)
      .limit(5)
      .sort('descending')
      .using('UserId-index')
      .exec();

    // Añadir username y salonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const [_, typeBehavior, beautySalonId] = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      const userData = {username: "notification.username", salonName: "notification.salonName"};
      /*await this.getUserNameAndSalonname(userId, typeBehavior, beautySalonId);*/
      return {
        UserID_TypeBehavior_BeautySalonID: notification.UserID_TypeBehavior_BeautySalonID,
        userId: notification.UserId,
        Timestamp: notification.Timestamp,
        Email: notification.Email, // Usar solo Email
        typeBehavior: notification.TypeBehavior,
        beautySalonId: notification.BeautySalonID,
        active: notification.Active,
        status: notification.Status,
        date: notification.Date,
        time: notification.Time,
        service: notification.Service,
        reminderId: notification.ReminderID,
        offerId: notification.OfferID,
        description: notification.Description,
        username: userData?.username || notification.username, // Actualizado
        salonName: userData?.salonName || notification.salonName // Actualizado
      };
    }));

    return enrichedNotifications;
  }

  /*async getUserNameAndSalonname(userId: string, typeBehavior: string, beautySalonId: string): Promise<{ username: string; salonName: string } | null> {
    Logger.log(`Buscando usuario con ID: ${userId}, tipo: ${typeBehavior}, salón: ${beautySalonId}`);
    const user_key = `${userId}#${typeBehavior}#${beautySalonId}`;
    const [notification] = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .eq(user_key)
      .limit(1)
      .exec();

    if (notification) {
      return {
        username: notification.username,
        salonName: notification.salonName,
      };
    }

    this.logger.warn(`No se encontró usuario con el ID: ${userId}, tipo: ${typeBehavior}, salón: ${beautySalonId}`);
    return null;
  }
  */
}
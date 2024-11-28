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
    Logger.log("Creando notificación");
    const timestamp = new Date().toISOString();
    const userKey = `${notificationDto.UserId}#${notificationDto.TypeBehavior}#${notificationDto.BeautySalonID}`;
    Logger.log("NOTIFICATION: ", JSON.stringify(notificationDto));                                                                                                                 6
    const notificationData: CreateNotificationDto = {
      UserID_TypeBehavior_BeautySalonID: userKey,
      UserId: notificationDto.UserId,  // Cambiado de 'UserId' a 'UserId'
      Timestamp: timestamp,
      Email: notificationDto.Email, // Usar solo Email
      TypeBehavior: notificationDto.TypeBehavior,
      BeautySalonID: notificationDto.BeautySalonID,
      Active: notificationDto.Active,  // Cambiado de 'active' a 'Active'
      Status: notificationDto.Status,  // Cambiado de 'status' a 'Status'
      Date: notificationDto.Date,  // Cambiado de 'date' a 'Date'
      Time: notificationDto.Time,  // Cambiado de 'time' a 'Time'
      Service: notificationDto.Service,  // Cambiado de 'service' a 'Service'
      ReminderID: notificationDto.ReminderID,  // Cambiado de 'reminderId' a 'ReminderID'
      OfferID: notificationDto.OfferID,  // Cambiado de 'OfferID' a 'OfferID'
      Description: notificationDto.Description,  // Cambiado de 'description' a 'Description'
      UserName: notificationDto.UserName,
      SalonName: notificationDto.SalonName
    };
    Logger.log("Datos de notificación", JSON.stringify(notificationData));
    return this.notificationModel.create(notificationData);
  }

  async findByUserAndType(UserId: string, type: string): Promise<Notification[]> {
    const notifications = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .beginsWith(`${UserId}#${type}`)
      .exec();
    Logger.log(`Notificaciones encontradas: ${notifications.length}`);
    // Añadir UserName y SalonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const [_, typeBehavior, BeautySalonID] = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      const userData = { UserName: "notification.UserName", SalonName: "notification.SalonName" };
      /*await this.getUserNameAndSalonname(UserId, typeBehavior, BeautySalonID);*/
      return {
        ...notification,
        UserName: userData?.UserName || notification.UserName,
        SalonName: userData?.SalonName || notification.SalonName,
      };
    }));

    return enrichedNotifications as Notification[];
  }

  async updateStatus(user_id: string, type_to_behavior: string, BeautySalonID: string, Status: 'Pending' | 'Sent' | 'Error') {
    const user_key = `${user_id}#${type_to_behavior}#${BeautySalonID}`;
    const [notification] = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .eq(user_key)
      .sort('descending')
      .limit(1)
      .exec();
    Logger.log(`Actualizando notificación con ID: ${user_key}`);
    if (notification) {
      await this.notificationModel.update({
        UserID_TypeBehavior_BeautySalonID: user_key,
        Timestamp: notification.Timestamp
      }, {
        Status: Status
      });
    } else {
      this.logger.warn(`No se encontró la notificación para actualizar`);
    }
  }

  async findRecentByTypeAndSalon(type_behavior: string, BeautySalonID: string) {
    return this.notificationModel
      .query('TypeBehavior')
      .eq(type_behavior)
      .where('BeautySalonID')
      .eq(BeautySalonID)
      .filter('Status')
      .eq('Pending')
      .and()
      .filter('Active')
      .eq(true)
      .using('TypeBehavior-BeautySalonID-index')
      .exec();
  }

  async getFollowers(BeautySalonID: string) {
    return this.notificationModel
      .query('TypeBehavior')
      .eq('Subscription')
      .where('BeautySalonID')
      .eq(BeautySalonID)
      .filter('Active')
      .eq(true)
      .exec();
  }

  async getRecentNotifications(type_behavior: string, BeautySalonID: string) {
    const notifications = await this.notificationModel
      .query('TypeBehavior')
      .eq(type_behavior)
      .where('BeautySalonID')
      .eq(BeautySalonID)
      .filter('Status')
      .eq('Pending')
      .and()
      .filter('Active')
      .eq(true)
      .using('TypeBehavior-BeautySalonID-index')
      .sort('descending')
      .limit(10)
      .exec();

    // Añadir UserName y SalonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const userKeyParts = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      /*const UserId = userKeyParts[0];
      const typeBehavior = userKeyParts[1];
      const BeautySalonID = userKeyParts[2];*/
      const userData = {
        UserName: "notification.UserName",
        SalonName: "notification.salon"
      }
      /*await this.getUserNameAndSalonname(UserId, typeBehavior, BeautySalonID);*/
      return {
        ...notification,
        UserName: userData?.UserName || notification.UserName,
        SalonName: userData?.SalonName || notification.SalonName,
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

  async getRecentNotificationsForUser(UserId: string): Promise<CreateNotificationDto[]> {
    const notifications = await this.notificationModel
      .query('UserId')
      .eq(UserId)
      .limit(5)
      .sort('descending')
      .using('UserId-index')
      .exec();

    // Añadir UserName y SalonName usando getUserNameAndSalonname
    const enrichedNotifications = await Promise.all(notifications.map(async (notification) => {
      const [_, typeBehavior, BeautySalonID] = notification.UserID_TypeBehavior_BeautySalonID.split('#');
      const userData = {UserName: "notification.UserName", SalonName: "notification.SalonName"};
      /*await this.getUserNameAndSalonname(UserId, typeBehavior, BeautySalonID);*/
      return {
        UserID_TypeBehavior_BeautySalonID: notification.UserID_TypeBehavior_BeautySalonID,
        UserId: notification.UserId,  // Cambiado de 'UserId' a 'UserId'
        Timestamp: notification.Timestamp,
        Email: notification.Email, // Usar solo Email
        TypeBehavior: notification.TypeBehavior,
        BeautySalonID: notification.BeautySalonID,
        Active: notification.Active,  // Cambiado de 'active' a 'Active'
        Status: notification.Status,  // Cambiado de 'status' a 'Status'
        Date: notification.Date,  // Cambiado de 'date' a 'Date'
        Time: notification.Time,  // Cambiado de 'time' a 'Time'
        Service: notification.Service,  // Cambiado de 'service' a 'Service'
        ReminderID: notification.ReminderID,  // Cambiado de 'reminderId' a 'ReminderID'
        OfferID: notification.OfferID,  // Cambiado de 'OfferID' a 'OfferID'
        Description: notification.Description,  // Cambiado de 'description' a 'Description'
        UserName: userData?.UserName || notification.UserName, // Actualizado
        SalonName: userData?.SalonName || notification.SalonName // Actualizado
      };
    }));

    return enrichedNotifications;
  }

  /*async getUserNameAndSalonname(UserId: string, typeBehavior: string, BeautySalonID: string): Promise<{ UserName: string; SalonName: string } | null> {
    Logger.log(`Buscando usuario con ID: ${UserId}, tipo: ${typeBehavior}, salón: ${BeautySalonID}`);
    const user_key = `${UserId}#${typeBehavior}#${BeautySalonID}`;
    const [notification] = await this.notificationModel
      .query('UserID_TypeBehavior_BeautySalonID')
      .eq(user_key)
      .limit(1)
      .exec();

    if (notification) {
      return {
        UserName: notification.UserName,
        SalonName: notification.SalonName,
      };
    }

    this.logger.warn(`No se encontró usuario con el ID: ${UserId}, tipo: ${typeBehavior}, salón: ${BeautySalonID}`);
    return null;
  }
  */
}
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { ResultDto, CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly priorityManager: PriorityNotificationManager,
  ) {}

  async handleSubscription(email: string, UserId: string): Promise<{ timestamp: string; Status: string }> {
    this.logger.log(`Processing subscription for ${email}`);
    const notificationDto = new CreateNotificationDto();
    notificationDto.UserId = UserId;
    notificationDto.Email = email; // Usar solo Email
    notificationDto.TypeBehavior = 'Subscription';  // Usar TypeBehavior en lugar de TypeBehavior
    notificationDto.UserID_TypeBehavior_BeautySalonID = `${UserId}_Subscription`;
    notificationDto.Timestamp = new Date().toISOString();
    notificationDto.BeautySalonID = 'default';
    notificationDto.SalonName = 'Sistema';
    notificationDto.UserName = 'Usuario';
    notificationDto.Active = true;
    notificationDto.Status = 'Pending';
    //notificationDto. = 'default'; // Agregar  para subscripciones
    
    await this.priorityManager.addNotificationToQueue(
      'Subscription',
      UserId,
      email,
      notificationDto
    );
    
    return {
      timestamp: new Date().toISOString(),
      Status: 'Subscription processed successfully'
    };
  }

  async handleReminder(data: {
    email: string;
    UserId: string;
    BeautySalonID: string;
    date: string;
    timeStr: string;
    service: string;
    SalonName?: string;
    UserName?: string;
  }): Promise<ResultDto> {
    this.logger.log(`Processing reminder for ${data.email}`);
    
    const notificationDto = new CreateNotificationDto();
    notificationDto.UserId = data.UserId;
    notificationDto.Email = data.email; // Usar solo Email
    notificationDto.TypeBehavior = 'Reminder';  // Usar TypeBehavior en lugar de TypeBehavior
    notificationDto.BeautySalonID = data.BeautySalonID; // Usar  en lugar de BeautySalonID
    notificationDto.Date = data.date;
    notificationDto.Time = data.timeStr;
    notificationDto.Service = data.service;
    notificationDto.SalonName = data.SalonName || 'Salon Default'; // Cambiar a SalonName
    notificationDto.UserName = data.UserName || 'Usuario Default'; // Cambiar a UserName
    notificationDto.UserID_TypeBehavior_BeautySalonID = `${data.UserId}_Reminder_${data.BeautySalonID}`;
    notificationDto.Timestamp = new Date().toISOString();
    notificationDto.Active = true;
    notificationDto.Status = 'Pending';
    Logger.log("Enviando a la cola de prioridad");
    await this.priorityManager.addNotificationToQueue(
      'Reminder',
      data.UserId,
      data.email,
      notificationDto
    );

    const resultDto = new ResultDto();
    resultDto.TypeBehavior = 'Reminder';
    resultDto.Date = data.date;
    resultDto.Time = data.timeStr;
    resultDto.Service = data.service;
    resultDto.Description = 'Reminder sent successfully';
    
    return resultDto;
  }

  async handleOffer(data: {
    email: string;
    UserId: string;
    BeautySalonID: string;
    OfferID: string;
    Description: string;
  }): Promise<ResultDto> {
    this.logger.log(`Processing offer for ${data.email}`);
    
    const notificationDto = new CreateNotificationDto();
    notificationDto.UserId = data.UserId;
    notificationDto.Email = data.email; // Usar solo Email
    notificationDto.TypeBehavior = 'Offer';  // Usar TypeBehavior en lugar de TypeBehavior
    notificationDto.BeautySalonID = data.BeautySalonID; // Usar  en lugar de BeautySalonID
    notificationDto.OfferID = data.OfferID;
    notificationDto.Description = data.Description;
    notificationDto.UserID_TypeBehavior_BeautySalonID = 
      `${data.UserId}_Offer_${data.BeautySalonID}`;
    notificationDto.Timestamp = new Date().toISOString();
    
    await this.priorityManager.addNotificationToQueue(
      'Offer',
      data.UserId,
      data.email,
      notificationDto
    );

    const resultDto = new ResultDto();
    resultDto.TypeBehavior = 'Offer';
    resultDto.Description = data.Description;
    
    return resultDto;
  }

  async processNotificationQueue() {
    this.logger.log('Starting queue processing');
    await this.priorityManager.processQueue();
    return { message: 'Queue processed successfully' };
  }

  async getQueueStatus() {
    const isEmpty = await this.priorityManager.empty();
    const Status = isEmpty ? 'Queue is empty' : 'Queue has pending messages';
    return Status;
    
  }

  async purgeQueue() {
    this.logger.log('Purging all queues');
    await this.priorityManager.purge();
    return { message: 'All queues purged successfully' };
  }

  async getRecentNotificationsForUser(UserId: string): Promise<ResultDto[]> {
    const notifications = await this.notificationRepository.getRecentNotificationsForUser(UserId);
    
    return notifications.map(notification => {
      const resultDto = new ResultDto();
      resultDto.TypeBehavior = notification.TypeBehavior as 'Reminder' | 'Offer';
      resultDto.SalonName = notification.SalonName;
      resultDto.UserName = notification.UserName;
      resultDto.Date = notification.Date;
      resultDto.Time = notification.Time;
      resultDto.Service = notification.Service;
      resultDto.Description = notification.Description;
      return resultDto;
    });
  }
}
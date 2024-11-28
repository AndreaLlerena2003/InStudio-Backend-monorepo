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

  async handleSubscription(email: string, userId: string): Promise<{ timestamp: string; status: string }> {
    this.logger.log(`Processing subscription for ${email}`);
    const notificationDto = new CreateNotificationDto();
    notificationDto.userId = userId;
    notificationDto.Email = email; // Usar solo Email
    notificationDto.typeBehavior = 'Subscription';
    notificationDto.UserID_TypeBehavior_BeautySalonID = `${userId}_Subscription`;
    notificationDto.Timestamp = new Date().toISOString();
    
    await this.priorityManager.addNotificationToQueue(
      'Subscription',
      userId,
      email,
      notificationDto
    );
    
    return {
      timestamp: new Date().toISOString(),
      status: 'Subscription processed successfully'
    };
  }

  async handleReminder(data: {
    email: string;
    userId: string;
    beautySalonId: string;
    date: string;
    timeStr: string;
    service: string;
  }): Promise<ResultDto> {
    this.logger.log(`Processing reminder for ${data.email}`);
    
    const notificationDto = new CreateNotificationDto();
    notificationDto.userId = data.userId;
    notificationDto.Email = data.email; // Usar solo Email
    notificationDto.typeBehavior = 'Reminder';
    notificationDto.beautySalonId = data.beautySalonId;
    notificationDto.date = data.date;
    notificationDto.time = data.timeStr;
    notificationDto.service = data.service;
    notificationDto.UserID_TypeBehavior_BeautySalonID = 
      `${data.userId}_Reminder_${data.beautySalonId}`;
    notificationDto.Timestamp = new Date().toISOString();
    Logger.log("Enviando a la cola de prioridad");
    await this.priorityManager.addNotificationToQueue(
      'Reminder',
      data.userId,
      data.email,
      notificationDto
    );

    const resultDto = new ResultDto();
    resultDto.typeBehavior = 'Reminder';
    resultDto.date = data.date;
    resultDto.time = data.timeStr;
    resultDto.service = data.service;
    resultDto.description = 'Reminder sent successfully';
    
    return resultDto;
  }

  async handleOffer(data: {
    email: string;
    userId: string;
    beautySalonId: string;
    offerId: string;
    description: string;
  }): Promise<ResultDto> {
    this.logger.log(`Processing offer for ${data.email}`);
    
    const notificationDto = new CreateNotificationDto();
    notificationDto.userId = data.userId;
    notificationDto.Email = data.email; // Usar solo Email
    notificationDto.typeBehavior = 'Offer';
    notificationDto.beautySalonId = data.beautySalonId;
    notificationDto.offerId = data.offerId;
    notificationDto.description = data.description;
    notificationDto.UserID_TypeBehavior_BeautySalonID = 
      `${data.userId}_Offer_${data.beautySalonId}`;
    notificationDto.Timestamp = new Date().toISOString();
    
    await this.priorityManager.addNotificationToQueue(
      'Offer',
      data.userId,
      data.email,
      notificationDto
    );

    const resultDto = new ResultDto();
    resultDto.typeBehavior = 'Offer';
    resultDto.description = data.description;
    
    return resultDto;
  }

  async processNotificationQueue() {
    this.logger.log('Starting queue processing');
    await this.priorityManager.processQueue();
    return { message: 'Queue processed successfully' };
  }

  async getQueueStatus() {
    const isEmpty = await this.priorityManager.empty();
    return {
      isEmpty,
      status: isEmpty ? 'Queue is empty' : 'Queue has pending messages'
    };
  }

  async purgeQueue() {
    this.logger.log('Purging all queues');
    await this.priorityManager.purge();
    return { message: 'All queues purged successfully' };
  }

  async getRecentNotificationsForUser(userId: string): Promise<ResultDto[]> {
    const notifications = await this.notificationRepository.getRecentNotificationsForUser(userId);
    
    return notifications.map(notification => {
      const resultDto = new ResultDto();
      resultDto.typeBehavior = notification.typeBehavior as 'Reminder' | 'Offer';
      resultDto.salonName = notification.salonName;
      resultDto.username = notification.username;
      resultDto.date = notification.date;
      resultDto.time = notification.time;
      resultDto.service = notification.service;
      resultDto.description = notification.description;
      return resultDto;
    });
  }
}
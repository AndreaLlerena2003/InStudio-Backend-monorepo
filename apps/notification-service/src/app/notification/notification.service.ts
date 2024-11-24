import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository, INotification } from './notification.repository';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';
import { ResultDto } from '../dto/notification.dto'; // Asegúrate de importar ResultDto

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly priorityManager: PriorityNotificationManager,
    private readonly kafkaService: KafkaService,
  ) {
    kafkaService.init();
  }

  async handleSubscription(email: string, userId: string): Promise<ResultDto> {
    this.logger.log(`Processing subscription for ${email}`);
    await this.priorityManager.addNotificationToQueue(
      'Subscription',
      userId,
      email,
      {}
    );
    return {
      date: new Date().toISOString(),
      time: '', // Asigna según corresponda
      service: 'Subscription',
      description: 'Subscription processed successfully',
      salonId: '', // Asigna según corresponda o utiliza otro método para obtenerlo
    };
  }

  async handleReminder(data: {
    email: string,
    userId: string,
    beautySalonId: string,
    date: string,
    timeStr: string,
    service: string
  }): Promise<ResultDto> {
    this.logger.log(`Processing reminder for ${data.email}`);
    await this.priorityManager.addNotificationToQueue(
      'Reminder',
      data.userId,
      data.email,
      {
        beauty_salon_id: data.beautySalonId,
        date: data.date,
        time_str: data.timeStr,
        service: data.service
      }
    );
    return {
      date: data.date,
      time: data.timeStr,
      service: data.service,
      description: 'Reminder sent successfully',
      salonId: data.beautySalonId,
    };
  }

  async handleOffer(data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }): Promise<ResultDto> {
    this.logger.log(`Processing offer for ${data.email}`);
    await this.priorityManager.addNotificationToQueue(
      'Offer',
      data.userId,
      data.email,
      {
        beauty_salon_id: data.beautySalonId,
        offer_id: data.offerId,
        description: data.description
      }
    );
    return {
      date: new Date().toISOString(), // Asigna según corresponda
      time: '', // Asigna según corresponda
      service: 'Offer',
      description: data.description,
      salonId: data.beautySalonId,
    };
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

  async getRecentNotificationsForUser(userId: string): Promise<INotification[]> {
    return this.notificationRepository.getRecentNotificationsForUser(userId);
  }

}
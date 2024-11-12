import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { PriorityNotificationManager } from '../../services/priority-notification-manager';
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';

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

  async handleSubscription(email: string, userId: string) {
    this.logger.log(`Processing subscription for ${email}`);
    await this.priorityManager.addNotificationToQueue(
      'Subscription',
      userId,
      email,
      {}
    );
    return { message: 'Subscription queued successfully' };
  }

  async handleReminder(data: {
    email: string,
    userId: string,
    beautySalonId: string,
    date: string,
    timeStr: string,
    service: string
  }) {
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
    return { message: 'Reminder queued successfully' };
  }

  async handleOffer(data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }) {
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
    return { message: 'Offer queued successfully' };
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
}
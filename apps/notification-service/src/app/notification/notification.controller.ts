import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('reservation-created')
  async handleReservationCreated(@Payload() data: {
    email: string,
    userId: string,
    beautySalonId: string,
    date: string,
    timeStr: string,
    service: string
  }) {
    return await this.notificationService.handleReminder(data);
  }

  @EventPattern('offer-created')
  async handleOfferCreated(@Payload() data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }) {
    return await this.notificationService.handleOffer(data);
  }

  @Post('subscribe')
  async subscribe(@Body() data: { email: string, userId: string }) {
    return this.notificationService.handleSubscription(data.email, data.userId);
  }

  @Post('send-reminder')
  async sendReminder(@Body() data: { 
    email: string, 
    userId: string, 
    beautySalonId: string,
    date: string,
    timeStr: string,
    service: string 
  }) {
    return this.notificationService.handleReminder(data);
  }

  @Post('send-offer')
  async sendOffer(@Body() data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }) {
    return this.notificationService.handleOffer(data);
  }

  @Post('process-queue')
  async processQueue() {
    return this.notificationService.processNotificationQueue();
  }

  @Get('queue-status')
  async getQueueStatus() {
    return this.notificationService.getQueueStatus();
  }

  @Post('purge-queue')
  async purgeQueue() {
    return this.notificationService.purgeQueue();
  }
}
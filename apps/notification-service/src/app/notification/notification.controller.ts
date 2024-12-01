import { Controller, Post, Body, Get, Logger, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';

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
    Logger.log('Reservation created', JSON.stringify(data));
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
    Logger.log('Notification created', JSON.stringify(data));
    return await this.notificationService.handleOffer(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() data: { email: string, userId: string }) {
    return this.notificationService.handleSubscription(data.email, data.userId);
  }

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
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

  @UseGuards(JwtAuthGuard)
  @Post('process-queue')
  async processQueue() {
    return this.notificationService.processNotificationQueue();
  }

  @UseGuards(JwtAuthGuard)
  @Get('queue-status')
  async getQueueStatus() {
    return this.notificationService.getQueueStatus();
  }

  @UseGuards(JwtAuthGuard)
  @Post('purge-queue')
  async purgeQueue() {
    return this.notificationService.purgeQueue();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-notifications')
  async getUserNotifications(@Request() req) {
    const userId = req.user.userId;
    const notifications = await this.notificationService.getUserNotifications(userId);
    Logger.log('User notifications', JSON.stringify(notifications));
    
    // Aseguramos que notifications sea un array simple
    const cleanNotifications = Array.isArray(notifications[0]) ? notifications[0] : notifications;
    
    return { 
      success: true,
      data: cleanNotifications,
      message: 'Notifications retrieved successfully'
    };
  }
}
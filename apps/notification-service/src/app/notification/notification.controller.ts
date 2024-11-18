import { Controller, Post, Body, Get, Logger, UseGuards, Request, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib'; // Asegúrate de la ruta correcta

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
    try {
      if (!data.email || !data.userId || !data.beautySalonId || !data.date || !data.timeStr || !data.service) {
        throw new BadRequestException('Faltan campos requeridos');
      }
      Logger.log('Reservation created', JSON.stringify(data));
      return await this.notificationService.handleReminder(data);
    } catch (error) {
      Logger.error('Error en handleReservationCreated', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @EventPattern('offer-created')
  async handleOfferCreated(@Payload() data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }) {
    try {
      if (!data.email || !data.userId || !data.beautySalonId || !data.offerId || !data.description) {
        throw new BadRequestException('Faltan campos requeridos');
      }
      Logger.log('Notification created', JSON.stringify(data));
      return await this.notificationService.handleOffer(data);
    } catch (error) {
      Logger.error('Error en handleOfferCreated', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @EventPattern('userRegisteredNotification')
  async handleUserCreated(@Payload() data: {
    email: string,
    userId: string,
    userName: string
  }) {
    Logger.log('User created, sending subscription email', JSON.stringify(data));
    return await this.notificationService.handleSubscription(data.email, data.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() data: { email: string, userId: string }) {
    try {
      if (!data.email || !data.userId) {
        throw new BadRequestException('Email y userId son requeridos');
      }
      return this.notificationService.handleSubscription(data.email, data.userId);
    } catch (error) {
      Logger.error('Error en subscribe', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
  @Get('notificationsForUser')
  async getInitialNotifications(@Request() req) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new BadRequestException('userId es requerido');
      }
      Logger.log('Recibiendo peticiones', JSON.stringify(req.user));
      return this.notificationService.getRecentNotificationsForUser(userId);
    } catch (error) {
      Logger.error('Error en getInitialNotifications', error);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
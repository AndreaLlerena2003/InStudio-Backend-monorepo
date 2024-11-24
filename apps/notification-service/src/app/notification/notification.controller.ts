import { Controller, Post, Body, Get, Logger, UseGuards, Request, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib'; 
import { ResultDto } from '../dto/notification.dto';

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
  }): Promise<ResultDto> {
    try {
      if (!data.email || !data.userId || !data.beautySalonId || !data.date || !data.timeStr || !data.service) {
        throw new BadRequestException('Missing required fields');
      }
      Logger.log('Reservation created', JSON.stringify(data));
      const reminder = await this.notificationService.handleReminder(data);
      return reminder; // Retorna ResultDto directamente
    } catch (error) {
      Logger.error('Error in handleReservationCreated', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @EventPattern('offer-created')
  async handleOfferCreated(@Payload() data: {
    email: string,
    userId: string,
    beautySalonId: string,
    offerId: string,
    description: string
  }): Promise<ResultDto> {
    try {
      if (!data.email || !data.userId || !data.beautySalonId || !data.offerId || !data.description) {
        throw new BadRequestException('Missing required fields');
      }
      Logger.log('Notification created', JSON.stringify(data));
      const offer = await this.notificationService.handleOffer(data);
      return offer; // Returns ResultDto directly
    } catch (error) {
      Logger.error('Error in handleOfferCreated', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @EventPattern('userRegisteredNotification')
  async handleUserCreated(@Payload() data: {
    email: string,
    userId: string,
    userName: string
  }): Promise<ResultDto> {
    try {
      Logger.log('User created, sending subscription email', JSON.stringify(data));
      const subscription = await this.notificationService.handleSubscription(data.email, data.userId);
      return subscription; // Returns ResultDto directly
    } catch (error) {
      Logger.error('Error in handleUserCreated', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() data: { email: string, userId: string }) {
    try {
      if (!data.email || !data.userId) {
        throw new BadRequestException('Email y userId son requeridos');
      }
      const subscription = await this.notificationService.handleSubscription(data.email, data.userId);
      return { success: true, message: 'Suscripción procesada exitosamente', data: subscription };
    } catch (error) {
      Logger.error('Error en subscribe', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
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
    try {
      const reminder = await this.notificationService.handleReminder(data);
      return { success: true, message: 'Recordatorio enviado exitosamente', data: reminder };
    } catch (error) {
      Logger.error('Error en sendReminder', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
    try {
      const offer = await this.notificationService.handleOffer(data);
      return { success: true, message: 'Oferta enviada exitosamente', data: offer };
    } catch (error) {
      Logger.error('Error en sendOffer', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('process-queue')
  async processQueue() {
    try {
      const result = await this.notificationService.processNotificationQueue();
      return { success: true, message: 'Cola procesada exitosamente', data: result };
    } catch (error) {
      Logger.error('Error en processQueue', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('queue-status')
  async getQueueStatus() {
    try {
      const status = this.notificationService.getQueueStatus();
      return { success: true, message: 'Estado de la cola obtenido exitosamente', data: status };
    } catch (error) {
      Logger.error('Error en getQueueStatus', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Post('purge-queue')
  async purgeQueue() {
    try {
      const result = await this.notificationService.purgeQueue();
      return { success: true, message: 'Cola purgada exitosamente', data: result };
    } catch (error) {
      Logger.error('Error en purgeQueue', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
      const notifications = await this.notificationService.getRecentNotificationsForUser(userId);
      return { success: true, message: 'Notificaciones obtenidas exitosamente', data: notifications };
    } catch (error) {
      Logger.error('Error en getInitialNotifications', error);
      throw new HttpException(
        { success: false, message: error.message, ...(error.status ? { status: error.status } : {}) },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
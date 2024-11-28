import { 
  Controller, Post, Body, Get, Logger, UseGuards, Request, 
  BadRequestException, HttpException, HttpStatus 
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib'; 
import { ResultDto } from '../dto/notification.dto';
import { HttpService } from '@nestjs/axios';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly httpService: HttpService
  ) {}

  @EventPattern('reservation-created')
  async handleReservationCreated(@Payload() data: any): Promise<ResultDto> {
    try {
      Logger.log('Datos recibidos:', JSON.stringify(data));
      
      // Transformar los nombres de campos para que coincidan
      const transformedData = {
        email: data.email,
        UserId: data.userId,
        date: data.date,
        timeStr: data.timeStr,
        service: data.service,
        BeautySalonID: data.beautySalonId, // Convertir beautySalonId a BeautySalonID
        SalonName: 'Salon Default',
        UserName: 'Usuario Default'
      };

      if (!transformedData.email || !transformedData.UserId || 
          !transformedData.BeautySalonID || !transformedData.date || 
          !transformedData.timeStr || !transformedData.service) {
        Logger.error('Datos faltantes:', transformedData);
        throw new BadRequestException('Faltan campos requeridos');
      }

      Logger.log('Datos procesados:', JSON.stringify(transformedData));
      
      return await this.notificationService.handleReminder(transformedData);
    } catch (error) {
      Logger.error('Error en handleReservationCreated', error);
      throw error;
    }
  }

  @EventPattern('offer-created')
  async handleOfferCreated(@Payload() data: {
    email: string,
    UserId: string,
    BeautySalonID: string,
    OfferID: string,
    Description: string
  }): Promise<ResultDto> {
    try {
      if (!data.email || !data.UserId || !data.BeautySalonID || !data.OfferID || !data.Description) {
        throw new BadRequestException('Missing required fields');
      }
      Logger.log('Notification created', JSON.stringify(data));
      const offer = await this.notificationService.handleOffer(data);
      return offer; // Returns ResultDto directly
    } catch (error) {
      Logger.error('Error in handleOfferCreated', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @EventPattern('userRegisteredNotification')
  async handleUserCreated(@Payload() data: {
    email: string;
    UserId: string;
    userName: string;
  }): Promise<{ timestamp: string; Status: string }> {
    try {
      Logger.log('User created, sending subscription email', JSON.stringify(data));
      return await this.notificationService.handleSubscription(data.email, data.UserId);
    } catch (error) {
      Logger.error('Error in handleUserCreated', error);
      throw new HttpException(
        error.message,
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  async subscribe(@Body() data: { email: string; UserId: string }): Promise<{ success: boolean; message: string; data: any }> {
    try {
      if (!data.email || !data.UserId) {
        throw new BadRequestException('Email y UserId son requeridos');
      }
      const subscription = await this.notificationService.handleSubscription(data.email, data.UserId);
      return { success: true, message: 'Suscripción procesada exitosamente', data: subscription };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-reminder')
  async sendReminder(@Body() data: { 
    email: string, 
    UserId: string, 
    BeautySalonID: string,
    date: string,
    timeStr: string,
    service: string 
  }) {
    try {
      /*const reminderData = {
        ...data,
        SalonName: data.SalonName || 'Default Salon',
        UserName: data.UserName || 'Default User'
      };*/
      const reminder = await this.notificationService.handleReminder(data);
      return { success: true, message: 'Recordatorio Sent exitosamente', data: reminder };
    } catch (error) {
      Logger.error('Error en sendReminder', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-offer')
  async sendOffer(@Body() data: {
    email: string,
    UserId: string,
    BeautySalonID: string,
    OfferID: string,
    Description: string
  }) {
    try {
      const offer = await this.notificationService.handleOffer(data);
      return { success: true, message: 'Oferta enviada exitosamente', data: offer };
    } catch (error) {
      Logger.error('Error en sendOffer', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
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
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('queue-Status')
  async getQueueStatus(): Promise<{ success: boolean, message: string, Status: string }> {
    try {
      const Status = await this.notificationService.getQueueStatus();
      return { 
        success: true, 
        message: 'Estado de la cola obtenido exitosamente', 
        Status: Status ,
      };
    } catch (error) {
      Logger.error('Error en getQueueStatus', error);
      throw new HttpException(
        { success: false, message: error.message },
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
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
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('notificationsForUser')
  async getInitialNotifications(@Request() req): Promise<{ success: boolean; message: string; data: ResultDto[] }> {
    try {
      const UserId = req.user?.UserId;
      if (!UserId) {
        throw new BadRequestException('UserId es requerido');
      }
      
      const notifications = await this.notificationService.getRecentNotificationsForUser(UserId);
      return {
        success: true,
        message: 'Notificaciones obtenidas exitosamente',
        data: notifications
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.Status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

}
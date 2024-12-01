import { Injectable, Logger } from '@nestjs/common';
import { NotificationManager } from './notification-manager';
import { DistributedPriorityQueue } from './distributed-priority-queue';
import { Cron } from '@nestjs/schedule';
import { NotificationRepository } from '../app/notification/notification.repository';
import { CreateNotificationDto } from '../app/dto/notification.dto';

interface NotificationQueueData {
  notificationType: string;
  userId: string;
  email: string;
  data: {
    beauty_salon_id?: string;
    date?: string;
    time_str?: string;
    service?: string;
    offer_id?: string;
    description?: string;
  };
  [key: string]: unknown;
}

@Injectable()
export class PriorityNotificationManager extends NotificationManager {
  private priorityQueue: DistributedPriorityQueue;

  constructor(
    notificationRepository: NotificationRepository
  ) {
    super(notificationRepository);
    this.priorityQueue = new DistributedPriorityQueue();
  }

  async addNotificationToQueue(
    notificationType: string, 
    userId: string, 
    email: string, 
    data: Record<string, unknown>
  ): Promise<void> {
    const priorityLevel = this.getPriorityLevel(notificationType);
    const queueData: NotificationQueueData = {
      notificationType,
      userId,
      email,
      data: data as NotificationQueueData['data']
    };

    await this.priorityQueue.put(priorityLevel, queueData);
    Logger.log(`✅ ${notificationType} añadido a la cola '${priorityLevel}'`);
  }

  private getPriorityLevel(notificationType: string): string {
    const priorityMap: { [key: string]: string } = {
      'Reminder': 'high',
      'Offer': 'medium',
      'Subscription': 'low'
    };
    return priorityMap[notificationType] || 'low';
  }

  async processQueue(): Promise<void> {
    if (await this.priorityQueue.empty()) {
      Logger.log("🔄 No hay notificaciones pendientes en la cola");
      return;
    }

    Logger.log("\n🔄 Iniciando procesamiento de colas por prioridad...");
    let processedCount = 0;

    let message = await this.priorityQueue.get();
    while (message !== null) {
      const { data, priorityLevel } = message;
      const queueData = data as unknown as NotificationQueueData;

      try {
        Logger.log(`\n📨 Procesando notificación de prioridad ${priorityLevel}`);
        await this.processNotification(queueData);
        processedCount++;
      } catch (error) {
        console.error(`❌ Error procesando notificación:`, error);
      }

      message = await this.priorityQueue.get();
    }

    Logger.log(`\n✅ Procesamiento completado. ${processedCount} notificaciones procesadas.`);
  }

  async empty(): Promise<boolean> {
    return this.priorityQueue.empty();
  }

  async purge(): Promise<void> {

    await this.priorityQueue.purge();
    Logger.log('✅ Todas las colas han sido purgadas');
  }

  @Cron('*/5 * * * * *') // Se ejecuta cada 5 minuto
  async handleCronJob() {
    Logger.log('\n⏰ Ejecutando verificación programada de notificaciones...');
    await this.processQueue();
  }

  private async processNotification(queueData: NotificationQueueData): Promise<void> {
    const { notificationType, userId, email, data } = queueData;

    Logger.log(`\n📨 Procesando notificación:`);
    Logger.log(`- Tipo: ${notificationType}`);
    Logger.log(`- Usuario: ${userId}`);
    Logger.log(`- Email: ${email}`);

    switch (notificationType) {
      case 'Reminder':
        if (data.beauty_salon_id && data.date && data.time_str && data.service) {
          await this.send_reminder_notification(
            email,
            userId,
            data.beauty_salon_id,
            data.date,
            data.time_str,
            data.service
          );
          
          const notificationDto = new CreateNotificationDto();
          notificationDto.userId = userId;
          notificationDto.email = email;
          notificationDto.typeBehavior = 'Reminder';
          notificationDto.beautySalonId = data.beauty_salon_id;
          notificationDto.active = true;
          notificationDto.status = 'Enviado';
          notificationDto.date = data.date;
          notificationDto.time = data.time_str;
          notificationDto.service = data.service;

          await this.notificationRepository.create(notificationDto);
        }
        break;

      case 'Offer':
        if (data.beauty_salon_id && data.offer_id && data.description) {
          await this.send_offer_notification(
            userId,
            email,
            data.beauty_salon_id,
            data.offer_id,
            data.description
          );

          const notificationDto = new CreateNotificationDto();
          notificationDto.userId = userId;
          notificationDto.email = email;
          notificationDto.typeBehavior = 'Offer';
          notificationDto.beautySalonId = data.beauty_salon_id;
          notificationDto.active = true;
          notificationDto.status = 'Enviado';
          notificationDto.offerId = data.offer_id;
          notificationDto.description = data.description;

          await this.notificationRepository.create(notificationDto);
        }
        break;

      case 'Subscription':
        await this.subscribe_to_sns_topic(email);
        break;

      default:
        Logger.log(`⚠️ Tipo de notificación desconocido: ${notificationType}`);
    }
  }
  
}
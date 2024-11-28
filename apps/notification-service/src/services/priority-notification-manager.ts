import { Injectable, Logger, Inject } from '@nestjs/common';
import { NotificationManager } from './notification-manager';
import { DistributedPriorityQueue } from './distributed-priority-queue';
import { Cron } from '@nestjs/schedule';
import { NotificationRepository } from '../app/notification/notification.repository';
import { CreateNotificationDto } from '../app/dto/notification.dto';
import { ClientKafka } from '@nestjs/microservices';

export interface NotificationQueueData extends CreateNotificationDto {
  [key: string]: unknown;
}

@Injectable()
export class PriorityNotificationManager extends NotificationManager {
  private priorityQueue: DistributedPriorityQueue;

  constructor(
    notificationRepository: NotificationRepository,
    @Inject('user-client') protected readonly kafkaClient: ClientKafka
  ) {
    super(notificationRepository, kafkaClient);
    this.priorityQueue = new DistributedPriorityQueue();
  }

  async addNotificationToQueue(
    notificationType: string, 
    userId: string, 
    email: string, 
    data: CreateNotificationDto
  ): Promise<void> {
    const priorityLevel = this.getPriorityLevel(notificationType);
    const queueData: NotificationQueueData = {
      ...data,
      typeBehavior: notificationType as 'Subscription' | 'Reminder' | 'Offer', // Asegurar que typeBehavior esté presente
      userId,
      Email: email, // Usar solo Email
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
      Logger.log("🔄 No hay notificaciones Pendings en la cola");
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

  @Cron('*/5 * * * * *') // Se ejecuta cada 5 segundos
  async handleCronJob() {
    Logger.log('\n⏰ Ejecutando verificación programada de notificaciones...');
    await this.processQueue();
  }

  private async processNotification(queueData: NotificationQueueData): Promise<void> {
    const { typeBehavior, userId, beautySalonId, Email, date, time, service, offerId, description } = queueData;

    Logger.log(`\n📨 Procesando notificación:`);
    Logger.log(`- Tipo: ${typeBehavior}`);
    Logger.log(`- Usuario: ${userId}`);
    Logger.log(`- Email: ${Email}`);
    Logger.log(`- BeautySalonId: ${beautySalonId}`); 
    Logger.log(`- Fecha: ${date}`);
    Logger.log(`- Hora: ${time}`);
    switch (typeBehavior) {
      case 'Reminder':
        Logger.log("Enviando notificación de recordatorio...");
        if (beautySalonId && date && time && service) {
          await this.sendReminderNotification(
            Email, // Usar solo Email
            userId,
            date,
            time,
            service
          );

          const notificationDto = new CreateNotificationDto();
          notificationDto.userId = userId;
          notificationDto.Email = Email; // Usar solo Email
          notificationDto.typeBehavior = 'Reminder';
          notificationDto.beautySalonId = beautySalonId;
          notificationDto.active = true;
          notificationDto.status = 'Sent';
          notificationDto.date = date;
          notificationDto.time = time;
          notificationDto.service = service;
          await this.notificationRepository.create(notificationDto);
          Logger.log('✅ Notificación de recordatorio enviada');
        }
        break;

      case 'Offer':
        if (beautySalonId && offerId && description) {
          await this.sendOfferNotification(
            userId,
            Email, // Usar solo Email
            description
          );

          const notificationDto = new CreateNotificationDto();
          notificationDto.userId = userId;
          notificationDto.Email = Email; // Usar solo Email
          notificationDto.typeBehavior = 'Offer';
          notificationDto.beautySalonId = beautySalonId;
          notificationDto.active = true;
          notificationDto.status = 'Sent';
          notificationDto.offerId = offerId;
          notificationDto.description = description;
          await this.notificationRepository.create(notificationDto);
          Logger.log('✅ Notificación de oferta enviada');
        }
        break;

      case 'Subscription':
        await this.subscribeToSnsTopic(Email, { notificationType: 'Subscription' }); // Usar solo Email
        break;

      default:
        Logger.log(`⚠️ Tipo de notificación desconocido: ${typeBehavior}`);
    }
  }
}
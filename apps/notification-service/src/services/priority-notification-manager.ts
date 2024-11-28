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
    //@Inject('user-client') protected readonly kafkaClient: ClientKafka
  ) {
    super(notificationRepository);
    this.priorityQueue = new DistributedPriorityQueue();
  }

  async addNotificationToQueue(
    notificationType: string, 
    UserId: string, 
    email: string, 
    data: CreateNotificationDto
  ): Promise<void> {
    const priorityLevel = this.getPriorityLevel(notificationType);
    const queueData: NotificationQueueData = {
      ...data,
      TypeBehavior: notificationType as 'Subscription' | 'Reminder' | 'Offer', // Asegurar que TypeBehavior esté presente
      UserId,
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
    const { TypeBehavior, UserId, BeautySalonID, Email, Date, Time, Service, OfferID, Description } = queueData;
    // Cambiados: date->Date, time->Time, service->Service, OfferID->OfferID, description->Description

    Logger.log(`\n📨 Procesando notificación:`);
    Logger.log(`- Tipo: ${TypeBehavior}`);
    Logger.log(`- Usuario: ${UserId}`);
    Logger.log(`- Email: ${Email}`);
    Logger.log(`- BeautySalonId: ${BeautySalonID}`); 
    Logger.log(`- Fecha: ${Date}`);
    Logger.log(`- Hora: ${Time}`);
    switch (TypeBehavior) {
      case 'Reminder':
        Logger.log("Enviando notificación de recordatorio...");
        if (BeautySalonID && Date && Time && Service) {
          await this.sendReminderNotification(
            Email,
            UserId,
            Date,
            Time,
            Service
          );
          Logger.log("Notificación de recordatorio enviada");
          const notificationDto = new CreateNotificationDto();
          notificationDto.UserId = UserId;
          notificationDto.Email = Email;
          notificationDto.TypeBehavior = 'Reminder';
          notificationDto.BeautySalonID = BeautySalonID;
          notificationDto.Active = true;
          notificationDto.Status = 'Sent';
          notificationDto.Date = Date;
          notificationDto.Time = Time;
          notificationDto.Service = Service;
          notificationDto.UserName = 'Default User';
          notificationDto.SalonName = 'Default Salon';
          await this.notificationRepository.create(notificationDto);
          Logger.log('✅ Notificación de recordatorio enviada');
        }
        break;

      case 'Offer':
        if (BeautySalonID && OfferID && Description) {
          await this.sendOfferNotification(
            UserId,
            Email,
            Description
          );

          const notificationDto = new CreateNotificationDto();
          notificationDto.UserId = UserId;
          notificationDto.Email = Email;
          notificationDto.TypeBehavior = 'Offer';
          notificationDto.BeautySalonID = BeautySalonID;
          notificationDto.Active = true;
          notificationDto.Status = 'Sent';
          notificationDto.OfferID = OfferID;
          notificationDto.Description = Description;
          notificationDto.UserName = 'Default User';
          notificationDto.SalonName = 'Default Salon';
          await this.notificationRepository.create(notificationDto);
          Logger.log('✅ Notificación de oferta enviada');
        }
        break;

      case 'Subscription':
        await this.subscribeToSnsTopic(Email, { notificationType: 'Subscription' }); // Usar solo Email
        break;

      default:
        Logger.log(`⚠️ Tipo de notificación desconocido: ${TypeBehavior}`);
    }
  }
}
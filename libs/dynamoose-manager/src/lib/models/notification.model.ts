import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

// Clase que extiende Item para el modelo
export class Notification extends Item {
  UserID_TypeBehavior_BeautySalonID!: string;
  Timestamp!: string;
  Email!: string;
  TypeBehavior!: 'Subscription' | 'Reminder' | 'Offer';
  BeautySalonID!: string;
  Active!: boolean;
  Status!: 'Pendiente' | 'Enviado' | 'Error';
  UserId!: string; // Nuevo atributo
  Date?: string;
  Time?: string;
  Service?: string;
  ReminderID?: string;
  OfferID?: string;
  Description?: string;
}

export interface INotification {
  UserID_TypeBehavior_BeautySalonID: string;
  Timestamp: string;
  Email: string;
  TypeBehavior: 'Subscription' | 'Reminder' | 'Offer';
  BeautySalonID: string;
  Active: boolean;
  Status: 'Pendiente' | 'Enviado' | 'Error';
  UserId: string; // Añadido: Definición de 'UserId'
  Date?: string;
  Time?: string;
  Service?: string;
  ReminderID?: string;
  OfferID?: string;
  Description?: string;
}

export const NotificationSchema = new Schema(
  {
    // Clave primaria compuesta
    UserID_TypeBehavior_BeautySalonID: {
      type: String,
      hashKey: true, // Partition key
      required: true
    },
    Timestamp: {
      type: String,
      rangeKey: true, // Sort key
      required: true
    },

    // Atributos requeridos
    Email: {
      type: String,
      required: true
    },
    TypeBehavior: {
      type: String,
      enum: ['Subscription', 'Reminder', 'Offer'],
      required: true,
      index: {
        name: 'TypeBehavior-BeautySalonID-index',
        type: 'global',
        rangeKey: 'BeautySalonID',
        project: true,
        throughput: { read: 5, write: 5 }
      }
    },
    BeautySalonID: {
      type: String,
      required: true
    },
    Active: {
      type: Boolean,
      required: true,
      default: true
    },
    Status: {
      type: String,
      enum: ['Pendiente', 'Enviado', 'Error'],
      required: true,
      default: 'Pendiente'
    },
    UserId: { // Definición del nuevo atributo
      type: String,
      required: true,
      index: {
        name: 'UserId-index',
        type: 'global',
        rangeKey: 'Timestamp',
        project: true,
        throughput: { read: 5, write: 5 }
      }
    },

    // Atributos opcionales
    Date: {
      type: String,
      required: false
    },
    Time: {
      type: String,
      required: false
    },
    Service: {
      type: String,
      required: false
    },
    ReminderID: {
      type: String,
      required: false
    },
    OfferID: {
      type: String,
      required: false
    },
    Description: {
      type: String,
      required: false
    }
  },
  {
    saveUnknown: false, // No permitir atributos desconocidos
    timestamps: false  // No usar timestamps automáticos
  }
);

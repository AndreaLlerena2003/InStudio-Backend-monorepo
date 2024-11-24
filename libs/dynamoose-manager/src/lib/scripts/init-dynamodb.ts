import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common'; 

dotenv.config();

async function createNotificationTable() {
  const dynamodb = new AWS.DynamoDB({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-2'
  });

  const params = {
    TableName: 'Notification',
    KeySchema: [
      { AttributeName: 'UserID_TypeBehavior_BeautySalonID', KeyType: 'HASH' },
      { AttributeName: 'Timestamp', KeyType: 'RANGE' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'UserID_TypeBehavior_BeautySalonID', AttributeType: 'S' },
      { AttributeName: 'Timestamp', AttributeType: 'S' },
      { AttributeName: 'TypeBehavior', AttributeType: 'S' },
      { AttributeName: 'BeautySalonID', AttributeType: 'S' },
      { AttributeName: 'UserId', AttributeType: 'S' } // Añadido: Definición de 'UserId'
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TypeBehavior-BeautySalonID-index',
        KeySchema: [
          { AttributeName: 'TypeBehavior', KeyType: 'HASH' },
          { AttributeName: 'BeautySalonID', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'UserId-index',
        KeySchema: [
          { AttributeName: 'UserId', KeyType: 'HASH' },
          { AttributeName: 'Timestamp', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const result = await dynamodb.createTable(params).promise();
    Logger.log('Tabla creada exitosamente:', result);
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      Logger.log('La tabla ya existe');
    } else {
      console.error('Error creando la tabla:', error);
      throw error;
    }
  }
}

// Ejecutar la creación
createNotificationTable();
import { DynamoDBClient, CreateTableCommand, UpdateTableCommand, DescribeTableCommand, ScalarAttributeType, KeyType, ProjectionType } from '@aws-sdk/client-dynamodb';
import * as dotenv from 'dotenv';
import { Logger } from '@nestjs/common'; 
import { resolve } from 'path';

// Especifica la ruta del archivo .env
dotenv.config({ path: resolve('C:/Users/HP/Documents/Estudios/U/11/Arqui/InStudio-Backend-monorepo/apps/notification-service/.env') });

// Agregar registros para verificar que las variables de entorno se han cargado
console.log('ACCESS_KEY_ID:', process.env.ACCESS_KEY_ID ? 'Cargado' : 'Faltante');
console.log('SECRET_ACCESS_KEY:', process.env.SECRET_ACCESS_KEY ? 'Cargado' : 'Faltante');
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-2');

async function createOrUpdateNotificationTable() {
  // Verificar que las credenciales están presentes
  if (!process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
    Logger.error('Las credenciales de AWS no están configuradas correctamente.');
    process.exit(1);
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!
    }
  });

  const params = {
    TableName: 'Notification',
    KeySchema: [
      { AttributeName: 'UserID_TypeBehavior_BeautySalonID', KeyType: 'HASH' as KeyType },
      { AttributeName: 'Timestamp', KeyType: 'RANGE' as KeyType }
    ],
    AttributeDefinitions: [
      { AttributeName: 'UserID_TypeBehavior_BeautySalonID', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'Timestamp', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'TypeBehavior', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'BeautySalonID', AttributeType: 'S' as ScalarAttributeType },
      { AttributeName: 'UserId', AttributeType: 'S' as ScalarAttributeType }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'TypeBehavior-BeautySalonID-index',
        KeySchema: [
          { AttributeName: 'TypeBehavior', KeyType: 'HASH' as KeyType },
          { AttributeName: 'BeautySalonID', KeyType: 'RANGE' as KeyType }
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      },
      {
        IndexName: 'UserId-index',
        KeySchema: [
          { AttributeName: 'UserId', KeyType: 'HASH' as KeyType },
          { AttributeName: 'Timestamp', KeyType: 'RANGE' as KeyType }
        ],
        Projection: {
          ProjectionType: 'ALL' as ProjectionType
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
    const describeCommand = new DescribeTableCommand({ TableName: 'Notification' });
    await client.send(describeCommand);
    // Tabla existe, intentar actualizar
    const updateParams = {
      TableName: 'Notification',
      AttributeDefinitions: [
        { AttributeName: 'UserId', AttributeType: 'S' as ScalarAttributeType }
      ],
      GlobalSecondaryIndexUpdates: [
        {
          Create: {
            IndexName: 'UserId-index',
            KeySchema: [
              { AttributeName: 'UserId', KeyType: 'HASH' as KeyType },
              { AttributeName: 'Timestamp', KeyType: 'RANGE' as KeyType }
            ],
            Projection: {
              ProjectionType: 'ALL' as ProjectionType
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        }
      ]
    };
    const updateCommand = new UpdateTableCommand(updateParams);
    await client.send(updateCommand);
    Logger.log('Índice UserId-index agregado exitosamente');
  } catch (error: any) { // Cambiado el tipo de error a 'any'
    if (error.name === 'ResourceNotFoundException') {
      // Crear tabla si no existe
      const createCommand = new CreateTableCommand(params);
      const result = await client.send(createCommand);
      Logger.log('Tabla creada exitosamente:', result);
      return result;
    } else if (error.name === 'GlobalSecondaryIndexAlreadyExistsException') {
      Logger.log('El índice UserId-index ya existe');
    } else {
      console.error('Error al crear o actualizar la tabla:', error);
      throw error;
    }
  }
}

// Ejecutar la creación o actualización
createOrUpdateNotificationTable();

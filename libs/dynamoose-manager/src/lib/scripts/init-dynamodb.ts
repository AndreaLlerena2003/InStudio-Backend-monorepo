
import * as AWS from 'aws-sdk';
import * as dotenv from 'dotenv';

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
      { AttributeName: 'BeautySalonID', AttributeType: 'S' }
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
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  };

  try {
    const result = await dynamodb.createTable(params).promise();
    console.log('Tabla creada exitosamente:', result);
    return result;
  } catch (error) {
    if (error.code === 'ResourceInUseException') {
      console.log('La tabla ya existe');
    } else {
      console.error('Error creando la tabla:', error);
      throw error;
    }
  }
}

// Ejecutar la creación
createNotificationTable();
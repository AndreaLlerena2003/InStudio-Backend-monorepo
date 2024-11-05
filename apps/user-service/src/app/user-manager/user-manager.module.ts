import { Module } from '@nestjs/common';
import { UserManagerService } from './user-manager.service';
import { UserManagerController } from './user-manager.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import {User,City,District,Region} from '@backend-in-studio/db-manager-user';
import { KafkaManagerModule } from '@backend-in-studio/kafka-manager';
import {AuthLibModule} from '@backend-in-studio/auth-lib';
import { JwtAuthGuard } from '@backend-in-studio/auth-lib';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Module({
  imports: [
    SequelizeModule.forFeature([User,City,District,Region]), 
    KafkaManagerModule,
    AuthLibModule,
    ClientsModule.register([
      {
        name: 'auth-client',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'client-user-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'backend-InStudio-auth-service',
            allowAutoTopicCreation: true,
          },
        },
      }])
  ],
  providers: [UserManagerService, JwtAuthGuard],
  controllers: [UserManagerController]
})
export class UserManagerModule {}

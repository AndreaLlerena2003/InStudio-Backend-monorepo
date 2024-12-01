import { Module } from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { AuthManagerController } from './auth-manager.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthTokens, AuthUsers } from '@backend-in-studio/db-manager-auth';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { KafkaManagerModule} from '@backend-in-studio/kafka-manager';
//import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthLibModule } from '@backend-in-studio/auth-lib';
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`, 
        },
      }),
      inject: [ConfigService],
    }),
    SequelizeModule.forFeature([AuthTokens, AuthUsers]), 
    KafkaManagerModule,
    AuthLibModule
  ],
  providers: [AuthManagerService, JwtStrategy, LocalStrategy],
  controllers: [AuthManagerController]
})
export class AuthManagerModule {}

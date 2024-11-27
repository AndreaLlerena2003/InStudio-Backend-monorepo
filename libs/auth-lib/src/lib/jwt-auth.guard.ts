import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ClientKafka } from '@nestjs/microservices';
  import { catchError, Observable, tap } from 'rxjs';
  
import { firstValueFrom } from 'rxjs'; 

  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(@Inject('auth-client') private readonly kafkaClient: ClientKafka) {}
  
    async canActivate(
      context: ExecutionContext,
    ): Promise<boolean> {
      const authentication = this.getAuthentication(context);
      try {
        const user = await firstValueFrom(
          this.kafkaClient.send('validate_user', { Authentication: authentication }),
        );
        this.addUser(user, context);
<<<<<<< HEAD
        const externalId = user?.external_id; 
=======
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
        return true;
      } catch {
        throw new UnauthorizedException(); 
      }
    }
  
    private getAuthentication(context: ExecutionContext) {
        let authentication: string | undefined; 
        
        if (context.getType() === 'rpc') {
          authentication = context.switchToRpc().getData().Authentication;
        } else if (context.getType() === 'http') {
          authentication = context.switchToHttp().getRequest().cookies?.Authentication;
        }
        if (!authentication) {
          throw new UnauthorizedException('No value was provided for Authentication');
        }
        return authentication; 
    }
  
    private addUser(user: any, context: ExecutionContext) {
      if (context.getType() === 'rpc') {
        context.switchToRpc().getData().user = user;
      } else if (context.getType() === 'http') {
        context.switchToHttp().getRequest().user = user;
      }
    }

    async onModuleInit() {
<<<<<<< HEAD
      console.log('Connecting to Kafka...');
      try {
          console.log('Iniciando');
          await this.kafkaClient.subscribeToResponseOf('validate_user');
          await this.kafkaClient.subscribeToResponseOf('validate_user.reply');
          console.log('Connected to Kafka');
=======
      try {
          await this.kafkaClient.subscribeToResponseOf('validate_user');
          await this.kafkaClient.subscribeToResponseOf('validate_user.reply');
>>>>>>> f115753a002d0dace77d03d3b0cf2456f6d2827e
      } catch (error) {
          console.error('Failed to connect to Kafka', error);
      }
    }

  }
  
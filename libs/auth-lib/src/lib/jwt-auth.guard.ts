import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

<<<<<<< HEAD
  
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
      try {
          await this.kafkaClient.subscribeToResponseOf('validate_user');
          await this.kafkaClient.subscribeToResponseOf('validate_user.reply');
      } catch (error) {
          console.error('Failed to connect to Kafka', error);
      }
    }
=======
@Injectable()
export class JwtAuthGuard implements CanActivate, OnModuleInit {
  constructor(@Inject('auth-client') private readonly kafkaClient: ClientKafka) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[JwtAuthGuard] CanActivate called');
>>>>>>> origin/develop

    const authentication = this.getAuthentication(context);

    console.log('[JwtAuthGuard] Extracted authentication token:', authentication);

    try {
      const user = await firstValueFrom(
        this.kafkaClient.send('validate_user', { Authentication: authentication }),
      );

      console.log('[JwtAuthGuard] User validated:', user);

      this.addUser(user, context);

      console.log('[JwtAuthGuard] User added to request context');

      return true;
    } catch (error) {
      console.error('[JwtAuthGuard] Error validating user:', error);
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
  }

  private getAuthentication(context: ExecutionContext): string {
    let authentication: string | undefined;

    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData()?.Authentication;
      console.log('[JwtAuthGuard] Authentication extracted from RPC context:', authentication);
    } else if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();
      authentication = request.cookies?.Authentication;
      console.log('[JwtAuthGuard] Cookies:', request.cookies);
      console.log('[JwtAuthGuard] Authentication extracted from HTTP context:', authentication);
    }

    if (!authentication) {
      console.error('[JwtAuthGuard] No value provided for authentication');
      throw new UnauthorizedException('No value was provided for Authentication');
    }

    return authentication;
  }

  private addUser(user: any, context: ExecutionContext) {
    if (context.getType() === 'rpc') {
      context.switchToRpc().getData().user = user;
      console.log('[JwtAuthGuard] User added to RPC context:', user);
    } else if (context.getType() === 'http') {
      context.switchToHttp().getRequest().user = user;
      console.log('[JwtAuthGuard] User added to HTTP request:', user);
    }
  }

  async onModuleInit() {
    try {
      console.log('[JwtAuthGuard] Subscribing to Kafka topics...');
      await this.kafkaClient.subscribeToResponseOf('validate_user');
      console.log('[JwtAuthGuard] Subscribed to Kafka topics successfully');

      console.log('[JwtAuthGuard] Connecting to Kafka...');
      await this.kafkaClient.connect(); // Importante: Conectar explícitamente el cliente
      console.log('[JwtAuthGuard] Connected to Kafka successfully');
    } catch (error) {
      console.error('[JwtAuthGuard] Failed to initialize Kafka:', error);
    }
  }
}

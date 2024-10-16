import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { ClientProxy } from '@nestjs/microservices';
  import { catchError, Observable, tap } from 'rxjs';
  
import { firstValueFrom } from 'rxjs'; 
  
  @Injectable()
  export class JwtAuthGuard implements CanActivate {
    constructor(@Inject('BACKEND_IN_STUDIO') private readonly kafkaClient: ClientProxy) {}
  
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

  }
  
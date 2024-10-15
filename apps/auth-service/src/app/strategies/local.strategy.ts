import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthManagerService } from '../auth-manager/auth-manager.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authManagerService:  AuthManagerService) {
    super({ usernameField: 'email' }); 
  }

  async validate(email: string, password: string) {
    return this.authManagerService.validateUser(email, password);
  }
 
}


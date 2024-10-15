import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Types } from 'mongoose';
import { TokenPayload } from '../auth-manager/auth-manager.service';
import { AuthManagerService } from '../auth-manager/auth-manager.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authUserService: AuthManagerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ // define cómo se debe extraer el token JWT de la solicitud. 
        (request: any) => {
          return request?.Authentication; //-> extrae el token de la cookie de la Authentication
        },
      ]),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate({ userId }: TokenPayload) { 
    try {
      return await this.authUserService.getUser(userId);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}

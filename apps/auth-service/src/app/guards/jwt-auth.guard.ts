import { AuthGuard } from '@nestjs/passport';

export default class JwtAuthGuard extends AuthGuard('jwt') {}
//Este guard está encargado de verificar si el token JWT incluido en la solicitud es válido.
//Se usa para proteger rutas que requieren que el usuario esté autenticado mediante un token JWT. 
// --> si no lo tiene le negaremos el acceso
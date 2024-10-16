import { createParamDecorator, ExecutionContext } from '@nestjs/common';// crear decoradores personalizado
import { LoginUserDto } from '../dto/login-user.dto';

export const getCurrentUserByContext = (context: ExecutionContext): LoginUserDto => { //extraer el usuario autenticado según el tipo de contexto en el que se esté ejecutando la solicitud.
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest().user;
  }
  if (context.getType() === 'rpc') {
    return context.switchToRpc().getData().user;
  }
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
); //Crea un decorador personalizado llamado CurrentUser que se puede usar en los controladores para obtener el usuario autenticado automáticamente.

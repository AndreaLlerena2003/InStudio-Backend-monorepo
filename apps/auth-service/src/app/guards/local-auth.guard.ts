import { AuthGuard } from '@nestjs/passport';

export class LocalAuthGuard extends AuthGuard('local') {}
//este guard está encargado de manejar la autenticación basada en credenciales 
//(normalmente un nombre de usuario y contraseña).
// --> lo usamos en el inicio de sesion para verificar que 
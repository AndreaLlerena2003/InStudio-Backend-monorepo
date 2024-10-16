import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards , Res} from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Response } from 'express';
import { AuthUsers } from '@backend-in-studio/db-manager-auth';

@Controller('auth-manager')
export class AuthManagerController {
    constructor(

        private readonly authManagerService: AuthManagerService
    ) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authManagerService.registerUser(registerUserDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login-user')
    @HttpCode(HttpStatus.OK)
    async login(
        @CurrentUser() user: AuthUsers,
        @Res({ passthrough: true }) response: Response,
    ) {
  
        await this.authManagerService.login(user, response);
        response.send(user);
    }
}

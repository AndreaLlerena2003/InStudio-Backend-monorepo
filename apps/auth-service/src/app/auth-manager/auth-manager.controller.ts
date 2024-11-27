import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Res, Req } from '@nestjs/common';
import { AuthManagerService } from './auth-manager.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterAdminDto } from '../dto/register-admin.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { Response } from 'express';
import { AuthUsers } from '@backend-in-studio/db-manager-auth';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';
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

    @Post('register-admin')
    @HttpCode(HttpStatus.CREATED)
    async registerAdmin(@Body() registerAdminDto: RegisterAdminDto) {
        return this.authManagerService.registerAdmin(registerAdminDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login-user')
    @HttpCode(HttpStatus.OK)
    async loginUser(
        @CurrentUser() user: AuthUsers,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authManagerService.login(user, response);
        response.send(user);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login-admin')
    @HttpCode(HttpStatus.OK)
    async loginAdmin(
        @CurrentUser() admin: AuthUsers,
        @Res({ passthrough: true }) response: Response,
    ) {
        await this.authManagerService.login(admin, response);
        response.send(admin);
    }

    @MessagePattern('validate_user')
    async validateUser(data: { Authentication: string }) {
        console.log("Validating User....");
        const response = await this.authManagerService.validateToken(data, 0);
        return response;
    }

    @MessagePattern('validate_admin')
    async validateAdmin(data: { Authentication: string }) {
        return this.authManagerService.validateToken(data, 1);
    }

    @MessagePattern('get_email')
    async getEmail(userId: string) {
        return await this.authManagerService.getUserEmailByExternalId(userId);
    }

    @EventPattern('update-password')
    async handlePasswordUpdate(@Payload() payload: { newPassword: string, authentication: string }) {
        const { newPassword, authentication } = payload;
        try {
            await this.authManagerService.changePasswordByExternalId(authentication, newPassword);
        } catch (error) {
            console.error('Error updating password:', error);
            throw new Error('Failed to update password');
        }
    }



    @Post('logout')
    async logout(@Res({ passthrough: true }) response: Response) {
        await this.authManagerService.logout(response);
        response.sendStatus(200);
    }
}

import { InjectModel } from '@nestjs/sequelize';
import { AuthUsers } from '@backend-in-studio/db-manager-auth';
import { RegisterUserDto } from '../dto/register-user.dto';
import { RegisterAdminDto } from '../dto/register-admin.dto';
import {
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
  } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid'; 
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';

export interface TokenPayload {
    userId: string;
    role: number; 
}

@Injectable()
export class AuthManagerService {
    constructor(
        @InjectModel(AuthUsers)
        private readonly authService: typeof AuthUsers,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly kafkaService: KafkaService,
    ) {
        kafkaService.init();
    }

    async registerUser(registerUserDto: RegisterUserDto) {
        await this.validateCreateUserRequest(registerUserDto);
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
        const external_id = uuidv4();

        const newUser = await this.authService.create({
            email: registerUserDto.email,
            password: hashedPassword,
            role: 0, // User role
            external_id,
        });

        this.kafkaService.sendEvent(
            {
                id: external_id,
                name: registerUserDto.name,
                profile_photo_url: registerUserDto.profile_photo_url,
                districtId: registerUserDto.districtId,
            },
            'userRegistered',
        );

        return {
            message: 'User registered successfully',
            userId: newUser.external_id,
        };
    }

    async registerAdmin(registerAdminDto: RegisterAdminDto) {
        await this.validateCreateUserRequest(registerAdminDto);
        const hashedPassword = await bcrypt.hash(registerAdminDto.password, 10);
        const external_id = uuidv4();

        const newAdmin = await this.authService.create({
            email: registerAdminDto.email,
            password: hashedPassword,
            role: 1, 
            external_id,
        });

        this.kafkaService.sendEvent(
            {
                id: external_id,
                name: registerAdminDto.name,
                profile_photo_url: registerAdminDto.profile_photo_url,
            },
            'adminRegistered',
        );

        return {
            message: 'Admin registered successfully',
            adminId: newAdmin.external_id,
        };
    }

    async login(user: AuthUsers, response: Response) {
        const tokenPayload: TokenPayload = {
            userId: user.external_id,
            role: user.role,
        };
        const expires = new Date();
        expires.setSeconds(
            expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
        );

        const token = this.jwtService.sign(tokenPayload);
        response.cookie('Authentication', token, {
            httpOnly: true,
            expires,
            sameSite: 'none',
            maxAge:  3600000,  
        });
    }

    private async validateCreateUserRequest(request: RegisterUserDto | RegisterAdminDto) {
        const user = await this.authService.findOne({
            where: { email: request.email },
        });
        if (user) {
            throw new UnprocessableEntityException('Email already exists.');
        }
    }

    async validateUser(email: string, password: string) {
        const user = await this.authService.findOne({
            where: { email },
        });
        if (!user || !(await bcrypt.compare(password.trim(), user.password))) {
            throw new UnauthorizedException('Invalid credentials.');
        }
        return user;
    }

    async getUserByExternalId(external_id: string) {
        return this.authService.findOne({
            where: { external_id },
        });
    }

    async validateToken(data: { Authentication: string }, requiredRole?: number) {
        const { Authentication } = data;
        let payload: TokenPayload;
        try {
            payload = this.jwtService.verify(Authentication);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }

        const { userId, role } = payload;
        const user = await this.getUserByExternalId(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return { userId, role };
    }

    async changePasswordByExternalId(external_id: string, newPassword: string) {
        if (!newPassword || newPassword.trim().length < 6) {
            throw new UnprocessableEntityException('Password must be at least 6 characters long.');
        }
        const user = await this.authService.findOne({
            where: { external_id },
        });
        if (!user) {
            throw new UnauthorizedException('User not found.');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return {
            message: 'Password successfully changed.',
        };
    }

    async getUserEmailByExternalId(userId: string) {
        if (typeof userId !== 'string') {
            throw new Error(`Invalid userId type. Expected string, received ${typeof userId}`);
        }
    
        const user = await this.authService.findOne({
            where: { external_id: userId },
        });
        return user.email;
    }

    async logout(response: Response) {
        response.clearCookie('Authentication');
    }
}
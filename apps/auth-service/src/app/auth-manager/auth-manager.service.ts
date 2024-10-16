import { InjectModel } from '@nestjs/sequelize';
import { AuthUsers } from '@backend-in-studio/db-manager-auth';
import { RegisterUserDto } from '../dto/register-user.dto';
import {
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
  } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {JwtService} from '@nestjs/jwt';

export interface TokenPayload {
    userId: string;
}
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid'; 
import { KafkaService } from 'libs/kafka-manager/src/lib/kafka-service';

@Injectable()
export class AuthManagerService {
    constructor(
        @InjectModel(AuthUsers)
        private readonly authService : typeof AuthUsers,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly kafkaService: KafkaService,
    ){
        kafkaService.init();
    }

    async registerUser(registerUserDto: RegisterUserDto){
        await this.validateCreateUserRequest(registerUserDto);
        const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
        const external_id = uuidv4();
        console.log(`Password before hashing: ${registerUserDto.password}`);
        const newUser = await this.authService.create({
            email: registerUserDto.email,
            password: hashedPassword,
            role: 0,
            external_id: external_id
        });
        const userRegistered = {
            id: external_id,
            name: registerUserDto.name,
            profile_photo_url: registerUserDto.profile_photo_url,
            districtId: registerUserDto.districtId
        }
        this.kafkaService.sendEvent(userRegistered,'userRegistered');
        return {
            message: 'User registered successfully',
            userId: newUser.external_id
        };
    }
    
    async login(user: AuthUsers, response: Response){
        const tokenPayload: TokenPayload = {
            userId: user.external_id,
        };
        const expires = new Date();
        expires.setSeconds(
            expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
        ); 
        const token = this.jwtService.sign(tokenPayload);
        response.cookie('Authentication', token, { 
            httpOnly: true, 
            expires, 
        });
    }

    private async validateCreateUserRequest(request: RegisterUserDto) {
        let user: AuthUsers;
        try {
          user = await this.authService.findOne({
            where: {
                email: request.email
            }
          });
        } catch (err) {}
    
        if (user) {
          throw new UnprocessableEntityException('Email already exists.');
        }
    }
    
    async validateUser(email: string, password: string) {
        console.log(`Validating user with email: ${email}`); 
        const user = await this.authService.findOne({ 
            where: {
                email: email
            }
        });
        if (!user) {
            console.log(`No user found with email: ${email}`); 
            throw new UnauthorizedException('User not found.');
        }
        console.log(`User found: ${user.password}`);
        const passwordIsValid = await bcrypt.compare(password.trim(), user.password);
        if (!passwordIsValid) {
            console.log(`Invalid password for user: ${email}`); 
            throw new UnauthorizedException('Credentials are not valid.');
        }
    
        console.log(`Password valid for user: ${email}`); 
        return user;
    }

    async getUser(external_id: string) {
        const user = await this.authService.findOne({ 
            where: {
                external_id: external_id
            }
         });
        
        return user;    
    }
    
}



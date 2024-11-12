import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req, Get, Logger, Patch, BadRequestException } from '@nestjs/common';
import { Admin } from '@backend-in-studio/db-manager-admin'; 
import { EventPattern, Payload } from '@nestjs/microservices';
import {JwtAuthGuard} from '@backend-in-studio/auth-lib';
import { SalonManagerService } from './salon-manager.service';

@Controller('salon-manager')
export class SalonManagerController {
  private readonly logger = new Logger();
  constructor(private readonly salonManagerService: SalonManagerService) {}


}

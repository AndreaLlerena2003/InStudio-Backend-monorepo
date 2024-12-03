import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand,  DeleteObjectCommand, HeadObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly logger = new Logger(S3Service.name);

    constructor(private readonly configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
            },
        });
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME','');
    }

    async uploadFile(file: Express.Multer.File, folderPath: string): Promise<string> {
        const fileKey = `${folderPath}/${uuidv4()}-${file.originalname}`;
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client.send(command);
            this.logger.log(fileKey);
            return fileKey;
        } catch (error) {
            this.logger.error(`Error uploading file to S3: ${error}`);
            throw new InternalServerErrorException('Failed to upload file to S3');
        }
    }

    async deleteFile(fileKey: string): Promise<void> {
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            await this.s3Client.send(headCommand);
            const deleteCommand = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
    
            await this.s3Client.send(deleteCommand);
            this.logger.log(`File deleted successfully from S3: ${fileKey}`);
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'NotFound') {
                    this.logger.warn(`File not found in S3: ${fileKey}`);
                    return;
                }
                this.logger.error(`Error deleting file from S3: ${error.message}`);
            } else {
                this.logger.error(`An unknown error occurred: ${error}`);
            }
    
            throw new InternalServerErrorException('Failed to delete file from S3');
        }
    }

    async getFile(fileKey: string): Promise<Buffer> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const { Body } = await this.s3Client.send(command);

            if (Body instanceof Readable) {
                const chunks = [];
                for await (const chunk of Body) {
                    chunks.push(chunk);
                }
                const fileBuffer = Buffer.concat(chunks);
                this.logger.log(`File retrieved successfully from S3: ${fileKey}`);
                return fileBuffer;
            } else {
                throw new InternalServerErrorException('Failed to read file data from S3');
            }
        } catch (error) {
            this.logger.error(`Error retrieving file from S3: ${error}`);
            throw new InternalServerErrorException('Failed to retrieve file from S3');
        }
    }

    async listFiles(folderPath: string = ''): Promise<string[]> {
        try {
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: folderPath,
            });
    
            const { Contents } = await this.s3Client.send(command);
            const fileKeys = Contents ? Contents.map(item => item.Key).filter((key): key is string => key !== undefined) : [];
    
            this.logger.log(`📂 Files retrieved successfully from S3 bucket: ${fileKeys.length} files found.`);
            return fileKeys;
        } catch (error) {
            this.logger.error(`🔴 Error listing files from S3: ${error}`);
            throw new InternalServerErrorException('Failed to list files from S3');
        }
    }

    async getFileStream(filePath: string): Promise<Readable> {
        try {
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: filePath,
          });
    
          const { Body } = await this.s3Client.send(command);
    
          if (Body instanceof Readable) {
            this.logger.log(`File stream retrieved successfully from S3: ${filePath}`);
            return Body; 
          } else {
            throw new InternalServerErrorException('Failed to retrieve file stream from S3');
          }
        } catch (error) {
          this.logger.error(`Error retrieving file stream from S3: ${error}`);
          throw new InternalServerErrorException('Failed to retrieve file stream from S3');
        }
    }
}
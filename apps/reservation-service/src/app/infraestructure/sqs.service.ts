import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class SQSService {
    private readonly logger = new Logger(SQSService.name);
    private readonly client: SQSClient;
    constructor(private configService: ConfigService){
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
        this.client = new SQSClient({
            region: region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    private readonly queueUrl = 'https://sqs.us-east-1.amazonaws.com/761018859656/booking.fifo'; 

    async sendMessage(messageBody: any) {
        const command = new SendMessageCommand({
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(messageBody),
            MessageGroupId: 'booking-group',
            MessageDeduplicationId: messageBody.bookingUUID, 
        });

        try {
            const result = await this.client.send(command);
            this.logger.log(`Mensaje enviado a SQS FIFO: ${result.MessageId}`);
        } catch (error) {
            this.logger.error('Error enviando mensaje a SQS FIFO:', error);
            throw error;
        }
    }

    async receiveMessages() {
        const command = new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10,
            WaitTimeSeconds: 10,
        });

        try {
            const { Messages } = await this.client.send(command);
            return Messages || [];
        } catch (error) {
            this.logger.error('Error recibiendo mensajes de SQS FIFO:', error);
            throw error;
        }
    }

    async deleteMessage(receiptHandle: string) {
        const command = new DeleteMessageCommand({
            QueueUrl: this.queueUrl,
            ReceiptHandle: receiptHandle,
        });

        try {
            await this.client.send(command);
            this.logger.log(`Mensaje eliminado de SQS FIFO`);
        } catch (error) {
            this.logger.error('Error eliminando mensaje de SQS FIFO:', error);
            throw error;
        }
    }
}

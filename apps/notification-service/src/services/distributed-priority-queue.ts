import { 
    SQSClient, 
    SendMessageCommand, 
    ReceiveMessageCommand, 
    DeleteMessageCommand,
    GetQueueAttributesCommand,
    PurgeQueueCommand,
    SendMessageCommandOutput
} from "@aws-sdk/client-sqs";
import * as dotenv from 'dotenv';

dotenv.config();

export class DistributedPriorityQueue {
    private sqs: SQSClient;
    private priorityQueueUrls: { [key: string]: string };

    constructor() {
        this.sqs = new SQSClient({
            credentials: {
                accessKeyId: process.env.ACCESS_KEY_ID,
                secretAccessKey: process.env.SECRET_ACCESS_KEY,
            },
            region: 'us-east-2'
        });

        // Definir URLs de las colas por prioridad
        this.priorityQueueUrls = {
            'high': process.env.SQS_HIGH_PRIORITY_URL,
            'medium': process.env.SQS_MEDIUM_PRIORITY_URL,
            'low': process.env.SQS_LOW_PRIORITY_URL
        };
    }

    private getQueueUrl(priorityLevel: string): string | undefined {
        const url = this.priorityQueueUrls[priorityLevel];
        if (!url) {
            console.warn(`URL no encontrada para nivel de prioridad: ${priorityLevel}`);
        }
        return url;
    }

    async put(priorityLevel: string, item: Record<string, unknown>): Promise<SendMessageCommandOutput> {
        try {
            const queueUrl = this.getQueueUrl(priorityLevel);
            if (!queueUrl) {
                console.log(`❌ URL de cola no encontrada para prioridad '${priorityLevel}'`);
                throw new Error(`URL no encontrada para prioridad ${priorityLevel}`);
            }

            // Agregar timestamp para ayudar con el ordenamiento
            const message = {
                timestamp: `${Math.floor(Date.now() / 1000)}`,
                data: item
            };

            const command = new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: JSON.stringify(message),
                DelaySeconds: 0
            });

            const response = await this.sqs.send(command);
            return response;
        } catch (e) {
            console.log(`Error enviando mensaje a SQS: ${e}`);
            throw e;
        }
    }

    async get(): Promise<{ priorityLevel: string, data: Record<string, unknown> } | null> {
        // Prioridades en orden descendente
        for (const priorityLevel of ['high', 'medium', 'low']) {
            const queueUrl = this.getQueueUrl(priorityLevel);
            try {
                const command = new ReceiveMessageCommand({
                    QueueUrl: queueUrl,
                    MaxNumberOfMessages: 1,
                    WaitTimeSeconds: 5,
                    VisibilityTimeout: 30
                });
                const data = await this.sqs.send(command);
                if (data.Messages && data.Messages.length > 0) {
                    const message = data.Messages[0];
                    const body = JSON.parse(message.Body);
                    const receiptHandle = message.ReceiptHandle;

                    // Eliminar el mensaje procesado
                    const deleteCommand = new DeleteMessageCommand({
                        QueueUrl: queueUrl,
                        ReceiptHandle: receiptHandle,
                    });
                    await this.sqs.send(deleteCommand);

                    return { priorityLevel, data: body.data as Record<string, unknown> };
                }
            } catch (e) {
                console.log(`Error recibiendo mensaje de SQS: ${e}`);
                continue; // Intentar con la siguiente cola
            }
        }
        console.log("❌ No se encontraron mensajes en ninguna cola.");
        return null;
    }

    async empty(): Promise<boolean> {
        let totalMessages = 0;
        for (const priorityLevel of ['high', 'medium', 'low']) {
            const queueUrl = this.getQueueUrl(priorityLevel);
            try {
                const command = new GetQueueAttributesCommand({
                    QueueUrl: queueUrl,
                    AttributeNames: ['ApproximateNumberOfMessages'],
                });
                const data = await this.sqs.send(command);

                const numMessages = parseInt(data.Attributes.ApproximateNumberOfMessages, 10);
                totalMessages += numMessages;
            } catch (e) {
                console.log(`Error comprobando estado de la cola ${priorityLevel}: ${e}`);
            }
        }
        return totalMessages === 0;
    }

    async purge(): Promise<void> {
        for (const priorityLevel of ['high', 'medium', 'low']) {
            const queueUrl = this.getQueueUrl(priorityLevel);
            try {
                const command = new PurgeQueueCommand({
                    QueueUrl: queueUrl
                });
                await this.sqs.send(command);
                console.log(`✅ Cola SQS '${priorityLevel}' purgada exitosamente.`);

                // Pequeño delay entre purgas
                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (err) {
                console.log(`Error purgando la cola SQS '${priorityLevel}': ${err}`);
            }
        }
    }
}
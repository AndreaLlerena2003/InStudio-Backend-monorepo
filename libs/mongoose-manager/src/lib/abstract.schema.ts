import { Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema() 
export class AbstractDocument {
}

export type AbstractDocumentType = AbstractDocument & Document;

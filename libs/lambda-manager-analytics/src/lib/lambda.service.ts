import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import * as aws4 from 'aws4';
import { LambdaConfigService } from './lambda-config';

@Injectable()
export class LambdaService {
  private readonly awsAccessKey: string;
  private readonly awsSecretKey: string;
  private readonly awsRegion: string;
  private readonly serviceName: string = 'lambda'; // Nombre del servicio
  private readonly url: string;

  constructor(private lambdaConfigService: LambdaConfigService) {
    const awsConfig = this.lambdaConfigService.getAwsConfig();
    this.awsAccessKey = awsConfig.awsAccessKey;
    this.awsSecretKey = awsConfig.awsSecretKey;
    this.awsRegion = awsConfig.awsRegion;
    this.url = awsConfig.url;
  }

  async invokeLambda(payload: Record<string, any>): Promise<any> {

    // Configuración de la solicitud sin firma
    const request = {
      host: new URL(this.url).host,
      path: new URL(this.url).pathname,
      method: 'POST',
      url: this.url,
      service: this.serviceName,
      region: this.awsRegion,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    // Firma la solicitud
    aws4.sign(request, {
      accessKeyId: this.awsAccessKey,
      secretAccessKey: this.awsSecretKey,
    });

    try {
      // Realiza la solicitud firmada usando Axios
      const response = await axios({
        method: 'POST',
        url: request.url,
        headers: request.headers,
        data: payload,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Error al invocar la función Lambda: ${error}`);
    }
  }
}

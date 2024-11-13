import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LambdaConfigService {
  constructor(private configService: ConfigService) {}

  getAwsConfig() {
    return {
      awsAccessKey: this.configService.get<string>('AWS_ACCESS_KEY') || "",
      awsSecretKey: this.configService.get<string>('AWS_SECRET_KEY') || "",
      awsRegion: this.configService.get<string>('AWS_REGION') || "",
      url: this.configService.get<string>('URL') || "",
    };
  }
}

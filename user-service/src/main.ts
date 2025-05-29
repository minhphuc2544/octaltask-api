import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const grpcUrl = configService.get<string>('GRPC_USER_URL');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, './proto/user.proto'),
      url: grpcUrl,
    },
  });

  const grpcUrl2 = configService.get<string>('GRPC_USER_INFO_URL');

  const app2 = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'userinfo',
      protoPath: join(__dirname, './proto/userinfo.proto'),
      url: grpcUrl2,
    },
  });

  await app.listen();
  await app2.listen();
}
bootstrap();

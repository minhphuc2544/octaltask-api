import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientProviderOptions = {
  name: 'AUTH_PACKAGE',
  transport: Transport.GRPC,
  options: {
    package: 'auth',
    protoPath: join(__dirname, '../proto/auth.proto'),
    url: 'localhost:50051',
  },
};

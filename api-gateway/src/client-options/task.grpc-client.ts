import { ClientProviderOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptions: ClientProviderOptions = {
  name: 'TASK_PACKAGE',
  transport: Transport.GRPC,
  options: {
    package: 'task',
    protoPath: join(__dirname, '../proto/task.proto'),
    url: 'localhost:50052',
  },
};

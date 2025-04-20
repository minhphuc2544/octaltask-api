import { Injectable } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

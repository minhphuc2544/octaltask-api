
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';

interface AuthGrpcService {
  Login(data: { email: string; password: string }): any;
  Signup(data: { email: string; password: string; name: string }): any;
  RequestPasswordReset(data: { email: string }): any;
  ResetPassword(data: { token: string; newPassword: string }): any;
}

@Injectable()
export class AuthService implements OnModuleInit {

  
  private authService: AuthGrpcService;

  constructor(@Inject('AUTH_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthGrpcService>('AuthService');
  }

  Login(email: string, password: string) {
    console.log('GRPC login called with', this.authService.Login({ email, password }));
    return this.authService.Login({ email, password });
  }

  Signup(email: string, password: string, name: string) {
    return this.authService.Signup({ email, password, name });
  }

  RequestPasswordReset(email: string) {
    return this.authService.RequestPasswordReset({ email });
  }

  ResetPassword(token: string, newPassword: string) {
    return this.authService.ResetPassword({ token, newPassword });
  }
}
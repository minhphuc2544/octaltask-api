import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class GrpcUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    
    const rpcContext = context.switchToRpc();
    const metadata = rpcContext.getContext();
    const data = rpcContext.getData();
    console.log('GrpcUserInterceptor: Intercepting gRPC request...',data, metadata);
    // Extract user from metadata
    // if (!data.user||!data.user.userId) {
    //   throw new RpcException({
    //     code: status.UNAUTHENTICATED,
    //     message: 'User authentication required',
    //     details: {}
    //   });
    // }


    // // Validate user data structure
    // const user = data.user;
    // if (typeof user !== 'object' || !user.userId || !user.role) {
    //   throw new RpcException({
    //     code: status.UNAUTHENTICATED,
    //     message: 'Invalid user credentials',
    //     details: {}
    //   });
    // }

    return next.handle();
  }
}
import { Catch, ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { status } from '@grpc/grpc-js';

@Catch(RpcException)
export class GrpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    
    // Handle different error types appropriately
    if (typeof error === 'object') {
      // Custom structured error
      return throwError(() => ({
        code: error['code'] || status.INTERNAL,
        message: error['message'] || 'Unknown error',
        details: error['details'] || {}
      }));
    } else if (typeof error === 'string') {
      // Simple string error
      return throwError(() => ({
        code: status.INTERNAL,
        message: error,
        details: {}
      }));
    }
    
    // Default fallback
    return throwError(() => ({
      code: status.INTERNAL,
      message: 'Internal server error',
      details: {}
    }));
  }
}
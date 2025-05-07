import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ErrorLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('TaskService');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(err => {
        // Log the error with relevant context
        this.logger.error(`Error in ${context.getClass().name}.${context.getHandler().name}:`, err);
        
        // Enhanced logging for debugging
        if (process.env.NODE_ENV !== 'production') {
          this.logger.debug('Error context:', {
            class: context.getClass().name,
            handler: context.getHandler().name,
            data: context.switchToRpc().getData(),
          });
        }
        
        return throwError(() => err);
      }),
    );
  }
}
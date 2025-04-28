import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
   handleRequest(err, user, info) {
     console.log('Inside JwtAuthGuard - err:', err);
     console.log('Inside JwtAuthGuard - user:', user);
     console.log('Inside JwtAuthGuard - info:', info);
     if (err || !user) {
       console.log('JWT Authentication failed');
       console.log('JWT Error:', err);
       console.log('JWT User:', user);
       console.log('JWT Info:', info);
      
       return null; // hoặc throw new UnauthorizedException();
     }

     console.log('JWT Authentication successful');
     console.log('Authenticated User:', user);

     return user;
   }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
}
}

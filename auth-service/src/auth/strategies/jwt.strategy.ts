import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    console.log('Auth-service JWT_SECRET:', process.env.JWT_SECRET); 
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string, 
      
    });
  }
  

  async validate(payload: any) {
    console.log('Decoded payload:', payload);
    return { userId: payload.sub, email: payload.email , role: payload.role };
  }
}

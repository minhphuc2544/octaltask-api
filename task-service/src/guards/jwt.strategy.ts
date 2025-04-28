import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
 constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken) => {
        const secret = this.configService.get<string>('JWT_SECRET');
        console.log('JWT_SECRET inside secretOrKeyProvider:', secret);
        return secret;
      },
    });
  }

  async validate(payload: any) {
    console.log('Decoded payload:', payload);
    
    return { 
      userId: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
   }
  // async validate(payload: any) {
  //   return { userId: payload.sub, email: payload.email, role: payload.role };
  // }
}

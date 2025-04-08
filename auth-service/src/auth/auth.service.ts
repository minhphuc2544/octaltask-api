import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './strategies/user.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  getHello(): string {
    return 'Hello World!';
  }
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // Tạm hardcode, sau sẽ gọi user-service
  private users = [{ email: 'test@gmail.com', password: '123456', id: 1 }];

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(email: string, password: string, name: string) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashed, name });
    return this.userRepo.save(user);
  }

}

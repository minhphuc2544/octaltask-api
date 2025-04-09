import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/user.entity';


@Injectable()
export class AuthService {
  getHello(): string {
    return 'Hello World!';
  }
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Tạm hardcode, sau sẽ gọi user-service
  private users = [{ email: 'test@gmail.com', password: '123456', id: 1 }];

  async validateUser(email: string, password: string): Promise<any> {
    console.log('>>> [DEBUG] this.userRepo:', this.userRepo);
    const user = await this.userRepo.findOne({ where: { email } });
  
    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    const passwordMatch = await bcrypt.compare(password, user.password); // 👈 so sánh đúng cách
  
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
  
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role:user.role };
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

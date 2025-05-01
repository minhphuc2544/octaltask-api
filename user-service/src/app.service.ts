import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOneByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return null;
    return { id: user.id, email: user.email, password: user.password };
  }

  async createUser(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    const newUser = this.userRepo.create({ email, password: hash });
    const saved = await this.userRepo.save(newUser);
    return { id: saved.id, email: saved.email, password: saved.password };
  }

  async validatePassword(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return { isValid: false, userId: 0 };
    const isValid = await bcrypt.compare(password, user.password);
    return { isValid, userId: user.id };
  }
  getHello(): string {
    return 'Hello World!';
  }
}

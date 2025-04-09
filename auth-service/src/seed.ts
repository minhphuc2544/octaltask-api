
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { User } from '../../user-service/src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Role } from '../../user-service/src/users/entities/user.entity';
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);

  const existing = await userRepo.findOneBy({ email: 'admin@example.com' });
  if (existing) {
    console.log('Admin user already exists');
    await app.close();
    return;
  }

  const hashed = await bcrypt.hash('admin123', 10);
  const adminUser = userRepo.create({
    email: 'admin@example.com',
    password: hashed,
    role: Role.ADMIN
  });

  await userRepo.save(adminUser);
  console.log('✅ Admin user seeded');
  await app.close();
}
bootstrap();

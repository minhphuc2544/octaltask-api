import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

// DTOs (inline)
interface UpdateUserDto {
  email?: string;
  name?: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

interface AdminUpdateUserDto extends UpdateUserDto {
  role?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
        try {
            const user = await this.userRepo.findOne({
                where: { id },
            });
            return user;
        } catch (error) {
            throw new Error(`Failed to find user by ID: ${error.message}`);
        }
    }
    async findByIds(ids: number[]): Promise<User[]> {
        try {
            if (!ids || ids.length === 0) {
                return [];
            }

            const users = await this.userRepo.find({
                where: {
                    id: In(ids),
                },
            });
            return users;
        } catch (error) {
            throw new Error(`Failed to find users by IDs: ${error.message}`);
        }
    } async exists(userId: number): Promise<boolean> {
        try {
            const count = await this.userRepo.count({
                where: { id: userId },
            });
            return count > 0;
        } catch (error) {
            throw new Error(`Failed to check user existence: ${error.message}`);
        }
    }

  async getCurrentUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
  }

  async updateCurrentUser(userId: number, updateData: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepo.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user fields
    if (updateData.email) user.email = updateData.email;
    if (updateData.name) user.name = updateData.name;

    const updatedUser = await this.userRepo.save(user);
    const { password, resetToken, resetTokenExpires, ...safeUser } = updatedUser;
    return safeUser;
  }

  async changePassword(userId: number, changePasswordData: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(changePasswordData.currentPassword, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid current password');
    }

    // Hash new password and save
    user.password = await bcrypt.hash(changePasswordData.newPassword, 10);
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }

  async deleteCurrentUser(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(user);
    return { message: 'Account deleted successfully' };
  }

  async getAllUsers() {
    const users = await this.userRepo.find();
    
    // Remove sensitive information from all users
    const safeUsers = users.map(user => {
      const { password, resetToken, resetTokenExpires, ...safeUser } = user;
      return safeUser;
    });

    return safeUsers;
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, resetToken, resetTokenExpires, ...safeUser } = user;
    return safeUser;
  }

  async updateUserById(id: number, updateData: AdminUpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepo.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user fields
    if (updateData.email) user.email = updateData.email;
    if (updateData.name) user.name = updateData.name;
    if (updateData.role) user.role = updateData.role as any; // Cast to Role enum

    const updatedUser = await this.userRepo.save(user);
    const { password, resetToken, resetTokenExpires, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUserById(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }
}
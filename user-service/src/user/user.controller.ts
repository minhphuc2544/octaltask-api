import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';

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

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface UsersResponse {
  users: UserResponse[];
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'GetUserByIdInfo')
  async getUserByIdInfo(data: { id: number }): Promise<UserResponse> {
    console.log("hi");
    try {
      if (!data.id || typeof data.id !== 'number') {
        throw new RpcException('Invalid user ID format');
      }

      const user = await this.userService.findById(data.id);
      if (!user) {
        throw new RpcException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve user');
    }
  }

  @GrpcMethod('UserService', 'GetUsersByIds')
  async getUsersByIds(data: { ids: number[] }): Promise<UsersResponse> {
    try {
      if (!data.ids || !Array.isArray(data.ids)) {
        throw new RpcException('Invalid user IDs format');
      }

      const users = await this.userService.findByIds(data.ids);
      
      return {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }))
      };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to retrieve users');
    }
  }

  @GrpcMethod('UserService', 'ValidateUser')
  async validateUser(data: { userId: number, email?: string }): Promise<{ 
    exists: boolean; 
    user?: UserResponse 
  }> {
    try {
      if (!data.userId || typeof data.userId !== 'number') {
        throw new RpcException('Invalid user ID format');
      }

      const user = await this.userService.findById(data.userId);
      
      if (!user) {
        return { exists: false };
      }

      // Optional: validate email if provided
      if (data.email && user.email !== data.email) {
        return { exists: false };
      }

      return {
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to validate user');
    }
  }

  @GrpcMethod('UserService', 'CheckUserExists')
  async checkUserExists(data: { userId: number }): Promise<{ exists: boolean }> {
    try {
      if (!data.userId || typeof data.userId !== 'number') {
        throw new RpcException('Invalid user ID format');
      }

      const exists = await this.userService.exists(data.userId);
      return { exists };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to check user existence');
    }
  }
  
  @GrpcMethod('UserService', 'GetCurrentUser')
  async getCurrentUser(data: { user: any }) {
    try {
      console.log("data:",data);
      const user = await this.userService.getCurrentUser(data.user.userId);
      return { user };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to get current user');
    }
  }

  @GrpcMethod('UserService', 'UpdateCurrentUser')
  async updateCurrentUser(data: { email?: string; name?: string; user: any }) {
    try {
      const updateData: UpdateUserDto = {};
      if (data.email) updateData.email = data.email;
      if (data.name) updateData.name = data.name;

      const user = await this.userService.updateCurrentUser(data.user.userId, updateData);
      return { user };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to update current user');
    }
  }

  @GrpcMethod('UserService', 'ChangePassword')
  async changePassword(data: { currentPassword: string; newPassword: string; user: any }) {
    try {
      if (data.newPassword.length < 8) {
        throw new RpcException('Password must be at least 8 characters long');
      }

      const changePasswordData: ChangePasswordDto = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      };

      const result = await this.userService.changePassword(data.user.userId, changePasswordData);
      return result;
    } catch (error) {
      throw new RpcException(error.message || 'Failed to change password');
    }
  }

  @GrpcMethod('UserService', 'DeleteCurrentUser')
  async deleteCurrentUser(data: { user: any }) {
    try {
      const result = await this.userService.deleteCurrentUser(data.user.userId);
      return result;
    } catch (error) {
      throw new RpcException(error.message || 'Failed to delete current user');
    }
  }

  @GrpcMethod('UserService', 'GetAllUsers')
  async getAllUsers() {
    try {
      const users = await this.userService.getAllUsers();
      return { users };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to get all users');
    }
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: { id: number }) {
    console.log(data.id)
    try {
      const user = await this.userService.getUserById(data.id);
      return { user };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to get user by ID');
    }
  }

  @GrpcMethod('UserService', 'UpdateUserById')
  async updateUserById(data: { id: number; email?: string; name?: string; role?: string }) {
    try {
      const updateData: AdminUpdateUserDto = {};
      if (data.email) updateData.email = data.email;
      if (data.name) updateData.name = data.name;
      if (data.role) updateData.role = data.role;

      const user = await this.userService.updateUserById(data.id, updateData);
      return { user };
    } catch (error) {
      throw new RpcException(error.message || 'Failed to update user by ID');
    }
  }

  @GrpcMethod('UserService', 'DeleteUserById')
  async deleteUserById(data: { id: number }) {
    try {
      const result = await this.userService.deleteUserById(data.id);
      return result;
    } catch (error) {
      throw new RpcException(error.message || 'Failed to delete user by ID');
    }
  }
}
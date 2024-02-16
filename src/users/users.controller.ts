import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, updateUserDto } from './interfaces/user.interface';
import { UserEntity } from './Entities/userEntity';
import { EmailInterface } from 'src/email/interfaces/email.interface';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UserRepository } from './Repositories/userRepository.entity';

@Controller('users')
export class UsersController {
constructor(private userService: UsersService){}

    @Post('sendEmailForVerifyCode')
    async sendEmailForVerifyCode(@Body() dto : EmailInterface): Promise<any>{
      const result = await this.userService.sendEmailForVerifyCode(dto);
      return result;
    }

    @Post('validateVerifyCode')
    async validateVerifyCode(@Body() dto : EmailInterface): Promise<any>{
      const result = await this.userService.validateVerifyCode(dto);
      return result;
    }

    @UseGuards(AuthGuard)
    @Get('getUserDirectory')
    async getUserDirectory(@Request() req ){
      const user = req.user
      const result = await this.userService.getUserDirectory(user.id)
      return result;
    }

    @UseGuards(AuthGuard)
    @Patch('updateUserDirectory')
    async updateUserDirectory(@Request() req ,@Body() updateUserDto: updateUserDto){
      const user = req.user;
      const result = await this.userService.updateUserDirectory(user.id,updateUserDto)
      return result;
    }


    /**
     * ! deprecated method : do not use : it's for test
     */

    @Get('health')
    health(): string {
        return "this is users";
    }

    @Get('getAllUser')
    async findAll(): Promise<UserEntity[]>{
        const users = this.userService.findAll();
        return users;
    }

    @Post('getOneUser')
    async findOne(@Body()userDto: User): Promise<UserEntity>{
        const user = this.userService.findOne(userDto.username);
        return user;
    }

    @Get('getLatestUser')
    async getLatestUser(): Promise<any>{
      const user = await this.userService.setUserId();
      return user;
    }
}

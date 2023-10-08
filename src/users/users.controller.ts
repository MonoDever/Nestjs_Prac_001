import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { UserEntity } from './Entities/userEntity';

@Controller('users')
export class UsersController {
constructor(private userService: UsersService){}

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
}

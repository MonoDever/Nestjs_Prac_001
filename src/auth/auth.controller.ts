import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/interfaces/user.interface';
import { UserEntity } from 'src/users/Entities/userEntity';
import { AuthGuard } from './guard/auth.guard';
import { RefreshGuard } from './guard/refresh.quard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() userDto: User): Promise<any>{
        const user = this.authService.register(userDto);
        return user;
    }
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body()signInDTO: User): Promise<any>{
        const user = this.authService.signIn(signInDTO);
        return user;
    }
    @UseGuards(RefreshGuard)
    @Post('refresh')
    refresh(@Request()req, @Body()refreshDTO: User): Promise<any>{
        const user = req.user;
        return user;
    }
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/users/interfaces/user.interface';
import { UserEntity } from 'src/users/Entities/userEntity';
import { AuthGuard } from './guard/auth.guard';
import { RefreshGuard } from './guard/refresh.quard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() userDto: User): Promise<any> {
        console.log(JSON.stringify(userDto))
        console.log(JSON.stringify(userDto.username))
        const result = this.authService.register(userDto);
        return result;
    }
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body() signInDTO: User): Promise<any> {
        const user = await this.authService.signIn(signInDTO);
        return user;
    }
    @UseGuards(RefreshGuard)
    @Post('refresh')
    refresh(@Request() req, @Body() refreshDTO: User): Promise<any> {
        const user = req.user;
        return user;
    }
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
    @Post('changePassword')
    async changePassword(@Body() dto: User): Promise<any> {
        const response = await this.authService.changePassword(dto);
        return response;
    }
}
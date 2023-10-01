import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenEntity } from 'src/users/Entities/userEntity';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class AuthService {
    constructor(private userService: UsersService){}

    async signIn(userDto: User): Promise<any>{
        const user = await this.userService.findOne(userDto.username)
        const resultCompare = await this.comparePassword(userDto.password, user.password);
        if (!resultCompare){
            throw new UnauthorizedException();
        }
        const { password, ...result} = user;

        const secretKey = process.env.SECRET_KEY;
        const token = JWT.sign({
            id: user.userId,
        },secretKey,{
            expiresIn: 60
        })

        const refreshToken = JWT.sign({
            id: user.userId,
        },secretKey,{
            expiresIn: 1800
        })

        const userUpdate = {} as User;
        userUpdate.userId = user.userId
        userUpdate.refresh = refreshToken
        const userUpdated = await this.userService.updateUser(userUpdate);

        const auth = new AuthenEntity();
        auth.token = token;
        auth.refreshtoken = refreshToken;
        result.auth = auth;

        return result
    }

    private comparePassword = async (password: string, existPassword: string) => {

        const isPasswordCorrect = await bcrypt.compare(password, existPassword);
        return isPasswordCorrect;
    }
}

import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenEntity } from 'src/users/Entities/userEntity';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;

@Injectable()
export class AuthService {
    constructor(private userService: UsersService){}

    async register(userDto: User): Promise<any>{
        try{
            const user = await this.userService.insertUser(userDto);
        }catch(err){
             throw err;
        }
    }
    async signIn(userDto: User): Promise<any>{
        const user = await this.userService.findOne(userDto.username)
        if (!user || user.userId == null){
            throw new UnauthorizedException();
        }
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
    private setDateUTC = () => {
        const today = new Date();
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth() + 1;
        const day = today.getUTCDate();
        const hours = today.getUTCHours();
        const minutes = today.getUTCMinutes();
        const seconds = today.getUTCSeconds();
        const milliSeconds = today.getUTCMilliseconds();
        let dateUTC = Date.UTC(year, month, day, hours, minutes, seconds, milliSeconds)
        return new Date(dateUTC);
    }
}

import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ResultEntity } from 'src/users/Entities/resultEntity';
import { AuthenEntity, UserEntity } from 'src/users/Entities/userEntity';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { resultentity } from 'src/common/resultentity';
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('lodash');
@Injectable()
export class AuthService {
    constructor(private userService: UsersService) { }

    async register(userDto: User): Promise<resultentity> {
        try {
            const result = await this.userService.insertUser(userDto);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async signIn(userDto: User): Promise<any> {
        let totalSeconds = 0;
        function setTime() {
            totalSeconds = totalSeconds + 1;
        }
        var timer = setInterval(setTime,1000);

        let userEntity = new UserEntity
        try {
            userEntity = await this.userService.findOne(userDto.username)
            if (!userEntity || userEntity.userId == null) {
                // throw new UnauthorizedException();
                userEntity.username = userDto.username;
                userEntity.result.status = false;
                userEntity.result.statusCode = HttpStatus.BAD_REQUEST;
                userEntity.result.errorMassage = 'user is incorrect'
                return userEntity;
            }
            const resultCompare = await this.comparePassword(userDto.password, userEntity.password);
            if (!resultCompare) {
                // throw new UnauthorizedException();
                userEntity.result.status = false;
                userEntity.result.statusCode = HttpStatus.UNAUTHORIZED;
                userEntity.result.errorMassage = HttpStatus.UNAUTHORIZED.toString()
                return userEntity;
            }

            const secretKey = process.env.SECRET_KEY;
            const token = JWT.sign({
                id: userEntity.userId,
            }, secretKey, {
                expiresIn: 1800
            })

            const refreshToken = JWT.sign({
                id: userEntity.userId,
            }, secretKey, {
                expiresIn: 1800
            })

            const userUpdate = {} as User;
            userUpdate.userId = userEntity.userId
            userUpdate.refresh = refreshToken

            const userUpdated = await this.userService.updateUser(userUpdate);
            const auth = new AuthenEntity();
            if (userUpdated) {
                auth.token = token;
                auth.refreshtoken = refreshToken;
                userEntity.auth = auth;
                userEntity.result.status = true;
                userEntity.result.statusCode = HttpStatus.OK
            }

            // const { password, ...result} = userEntity;//remove password
            _.omit(userEntity, ['password'])

        } catch (error) {
            userEntity.result.status = false;
            userEntity.result.statusCode = HttpStatus.CONFLICT;
            userEntity.result.errorMassage = error.message;
        } finally {
            userEntity.result.methodName = 'signIn';
            userEntity.result.timeNow = this.getDateUTC();
            userEntity.result.timeUsed = `${totalSeconds} sec`
            console.log(_.omit(userEntity, ['password','auth']))
            return userEntity
        }
    }

    async changePassword(userDto: User): Promise<any> {
        const result = this.userService.changePassword(userDto);
        return result;
    }

    private comparePassword = async (password: string, existPassword: string) => {

        const isPasswordCorrect = await bcrypt.compare(password, existPassword);
        return isPasswordCorrect;
    }

    private getDateUTC = () => {
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
    private getYear = async () => {
        const today = new Date()
        const year = today.getUTCFullYear();
        return year
    }
}

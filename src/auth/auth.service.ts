import { ConflictException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenEntity, UserEntity } from 'src/users/Entities/userEntity';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
import { ResultEntity } from 'src/common/entities/resultentity';
import { CommonEntity } from 'src/common/entities/commonEntity';
import { TakeTimer } from 'src/common/utils/timer';
import { getDateUTC } from 'src/common/utility';
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const _ = require('lodash');
@Injectable()
export class AuthService {
    constructor(private userService: UsersService) { }

    async register(userDto: User): Promise<CommonEntity> {
        try {
            const result = await this.userService.insertUser(userDto);
            return result;
        } catch (err) {
            throw err;
        }
    }
    async signIn(userDto: User): Promise<any> {
        // let totalSeconds = 0;
        // function setTime() {
        //     totalSeconds = totalSeconds + 1;
        // }
        // var timer = setInterval(setTime,1000);
        const takeTimer = new TakeTimer();
        takeTimer.startTimer();

        let userEntity = new UserEntity(new ResultEntity());
        try {
            const userModel = await this.userService.findOne(userDto.username)
            if (!userModel || userModel.userId == null) {
                // throw new UnauthorizedException();
                // userEntity.username = userDto.username;
                // userEntity.result.status = false;
                // userEntity.result.statusCode = HttpStatus.BAD_REQUEST;
                // userEntity.result.errorMessage = 'user is incorrect'
                userEntity.result.setError('user is incorrect');
                return userEntity;
            }
            userEntity.user = userModel;
            const resultCompare = await this.comparePassword(userDto.password, userEntity.user.password);
            if (!resultCompare) {
                // throw new UnauthorizedException();
                // userEntity.result.status = false;
                // userEntity.result.statusCode = HttpStatus.UNAUTHORIZED;
                // userEntity.result.errorMessage = HttpStatus.UNAUTHORIZED.toString()
                userEntity.result.setError(HttpStatus.UNAUTHORIZED.toString(),HttpStatus.UNAUTHORIZED)
                return userEntity;
            }

            const secretKey = process.env.SECRET_KEY;
            const token = JWT.sign({
                id: userEntity.user.userId,
            }, secretKey, {
                expiresIn: 1800
            })

            const refreshToken = JWT.sign({
                id: userEntity.user.userId,
            }, secretKey, {
                expiresIn: 1800
            })

            const userUpdate = {} as User;
            userUpdate.userId = userEntity.user.userId
            userUpdate.refresh = refreshToken

            const userUpdated = await this.userService.updateUser(userUpdate);
            const auth = new AuthenEntity();
            if (userUpdated) {
                auth.token = token;
                auth.refreshtoken = refreshToken;
                userEntity.auth = auth;

                userEntity.result.setResult();
            }

            // const { password, ...result} = userEntity;//remove password
            _.omit(userEntity, ['password'])
            return userEntity;
        } catch (error) {
            userEntity.result.setException(error.message)
            console.log(_.omit(userEntity, ['password','auth']))
            return userEntity;
        } finally {
            userEntity.result.setFinal('signIn',await takeTimer.endTimer(),getDateUTC())
            _.omit(userEntity,["user.password"])
            console.log(userEntity)
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

}

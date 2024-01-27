import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './Repositories/userRepository.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './interfaces/user.interface';
import { UserEntity } from './Entities/userEntity';
import { ResultEntity } from './Entities/resultEntity';
import { EmailService } from 'src/email/email.service';
import { deserialize, serialize } from 'v8';
import { validateEmail } from 'src/common/utility';
import { EmailInterface } from 'src/email/interfaces/email.interface';

const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;


@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserRepository)
    private readonly userRepository: Repository<UserRepository>,
        private emailService: EmailService
    ) { }


    async findAll(): Promise<UserEntity[]> {
        const result = await this.userRepository.find();
        const resultMapping = this.dataMapping("userEntity", result);
        const userEntity = new Array<UserEntity>(resultMapping);
        return userEntity;
    }
    async findOne(username: string): Promise<UserEntity> {
        const userResult = await this.userRepository.find({
            where: {
                username: username
            }
        });
        if (userResult.length > 0) {
            const { id, ...result } = userResult[0];
            const resultMapping = this.dataMapping(UserEntity, result);
            const userEntity: UserEntity = resultMapping;
            return userEntity;
        } else {
            return new UserEntity();
        }
    }

    async findUser(username: string): Promise<UserRepository>{
        const result = await this.userRepository.find({
            where: {
                username: username
            }
        });
        return result[0];
    }

    async insertUser(userDto: User): Promise<ResultEntity> {
        try {
            const resultEntity = new ResultEntity()
            /**
             * check user is already
             */
            const userAlready = await this.findOne(userDto.username);
            if (userAlready && userAlready.username !== null) {
                // throw new ConflictException('user is already');
                resultEntity.errorMessage = "User is already";
                resultEntity.isError = true;
                return resultEntity;
            }
            const user: User[] = [];
            /**
             * hash password and set user model
             */
            const hashPassword = bcrypt.hashSync(userDto.password, saltRounds);
            let date = this.setDateUTC();
            const newUser = new UserRepository();
            newUser.userId = userDto.userId = 'test';//todo
            newUser.username = userDto.username;
            newUser.password = hashPassword;
            newUser.isActive = true;
            newUser.createdBy = "SYSTEM";
            newUser.createdDate = date;

            // const userRegistered = this.userRepository.save(newUser)
            const userRegistered = await this.userRepository
                .query(`EXEC [oni].[SP_REGISTER_USER] @0, @1, @2, @3`, [userDto.username, `${hashPassword}`, 1, date]);
            // const resultMapping = this.dataMapping(User, userRegistered);

            if (userRegistered) {
                resultEntity.result = 'SUCCESS'
            }
            return resultEntity;
        } catch (err) {
            throw await new HttpException(err.message, HttpStatus.BAD_REQUEST)
        }
    }
    async changePassword(userDto: User): Promise<ResultEntity> {
        const resultEntity = new ResultEntity();
        try {
            /**
                 * check user is already
                 */
            const userAlready = await this.findUser(userDto.username);
            if (!(userAlready && userAlready.username !== null)) {
                resultEntity.errorMessage = "User is not already";
                resultEntity.isError = true;
            }
            /**
             * check password
             */
            const hashPassword = bcrypt.hashSync(userDto.password, saltRounds);
            userAlready.password = hashPassword;
            const user = await this.userRepository.save(userAlready);
            if (user) {
                resultEntity.result = "success"
            }

        } catch (error) {
            resultEntity.errorMessage = error.message
        }
        return resultEntity;
    }

    async updateUser(data: User) {
        const user = await this.userRepository.find({
            where: {
                userId: data.userId
            }
        });
        user[0].refresh = data.refresh;
        const userUpdated = this.userRepository.save(user[0]);
        return userUpdated;
    }

    async loginUser(data: User) {
        const secretKey = process.env.SECRET_KEY;

        const { username, password } = data;
        const user = await this.userRepository.find({
            where: {
                username: username
            }
        });
        if (!user) {
            throw new Error('user not found')
        }
        const resultCompare = await this.comparePassword(password, user[0].password);
        if (!resultCompare) {
            throw new Error('password is incorrect')
        }

        const token = JWT.sign({
            id: user[0].userId,
        }, secretKey, {
            expiresIn: 60
        })

        return token;
    }

    async sendEmailForVerifyCode(emailDTO: EmailInterface): Promise<any> {
        const resultEntity = new ResultEntity();
        try {
            const validEmail = validateEmail(emailDTO.email);
            if (!validEmail) {
                resultEntity.result = "fail"
                resultEntity.isError = true;
                resultEntity.errorMessage = "Email format is incorrect.";
                return resultEntity;
            }
            const user = await this.findUser(emailDTO.email)
            if(!user){
                resultEntity.result = "fail"
                resultEntity.isError = true;
                resultEntity.errorMessage = "Email is not already in system.";
                return resultEntity;
            }
            const emailResponse = await this.emailService.sendMail(emailDTO.email)
            if (emailResponse) {
                resultEntity.result = "success";
            }
        } catch (error) {
            resultEntity.result = "fail";
            resultEntity.isError = true;
            resultEntity.errorMessage = error.message;
        }
        return resultEntity;
    }

    async getLogVerifyCode(email: string): Promise<any> {
        const response = await this.emailService.getLogVerifyCode(email)
        return response;
    }

    async validateVerifyCode(emailDTO: EmailInterface): Promise<any> {
        const resultEntity = new ResultEntity()
        const verifyCode = await this.emailService.getLogVerifyCode(emailDTO.email);
        if (emailDTO.verifyCode == verifyCode) {
            resultEntity.result = "success"
        } else {
            resultEntity.result = "fail"
        }
        return resultEntity;
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


    private dataMapping = (classType, origin: any) => {
        let instance = new classType();
        Object.keys(origin).forEach((key) => {
            console.log(origin[key])
            Object.keys(instance).forEach((instanceKey) => {
                if (instanceKey == key) {
                    instance[instanceKey] = origin[key]
                }
            })
        })

        // const jsonString = JSON.stringify(origin);
        // const jsonString = serialize(origin)
        // const jsonObject : UserEntity = deserialize(jsonString)
        // const jsonObject : UserEntity = JSON.parse(jsonString) as UserEntity;
        // return jsonObject;
        return instance;
    }
}

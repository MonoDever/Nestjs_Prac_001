import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './Repositories/userRepository.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './interfaces/user.interface';
import { UserEntity } from './Entities/userEntity';
import { deserialize, serialize } from 'v8';
import { promises } from 'dns';
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;


@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserRepository)
    private readonly userRepository: Repository<UserRepository>) { }

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
        if(userResult.length > 0){
            const { id, ...result } = userResult[0];
            const resultMapping = this.dataMapping(UserEntity, result);
            const userEntity: UserEntity = resultMapping;
            return userEntity;
        }else{
            return new UserEntity();
        }
    }

    async insertUser(userDto: User): Promise<UserEntity>{
        try {
            /**
             * check user is already
             */
            // const userAlready =  await this.findOne(userDto.username)//แก้ async ตอน throw exception
            const userAlready = await this.findOne(userDto.username);
            if (userAlready && userAlready.username !== null) {
                throw new ConflictException('user is already');
            }
            const user: User[] = [];
            /**
             * hash password and set user model
             */
            const hashPassword = bcrypt.hashSync(userDto.password, saltRounds);
            let date = this.setDateUTC();
            const newUser = new UserRepository();
            newUser.userId = userDto.userId;//todo
            newUser.username = userDto.username;
            newUser.password = hashPassword;
            newUser.isActive = true;
            newUser.createdBy = "SYSTEM";
            newUser.createdDate = date;

            const userRegistered = this.userRepository.save(newUser)
            const resultMapping = this.dataMapping(User, userRegistered);
            return await resultMapping;
        } catch (err) {
           throw await new HttpException(err.message, HttpStatus.BAD_REQUEST)
        }
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

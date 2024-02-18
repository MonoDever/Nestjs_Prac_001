import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './Repositories/userRepository.entity';
import { Connection, Repository, getConnection, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, updateUserDto } from './interfaces/user.interface';
import { UserDirectoryEntity, UserDirectoryModel, UserEntity, UserModel } from './Entities/userEntity';
import { EmailService } from 'src/email/email.service';
import { deserialize, serialize } from 'v8';
import { dataMapping, getDateUTC, getYear, validateEmail } from 'src/common/utility';
import { EmailInterface } from 'src/email/interfaces/email.interface';
import { UserDirectory } from './Repositories/userDirectory.entity';
import { ResultEntity } from 'src/common/entities/resultEntity';
import { TakeTimer } from 'src/common/utils/timer';
import { CommonEntity } from 'src/common/entities/commonEntity';

const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const saltRounds = 10;


@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: Repository<UserRepository>,
        @InjectRepository(UserDirectory)
        private readonly userdirectoryRepository: Repository<UserDirectory>,
        private emailService: EmailService,
        private dataSource: DataSource
    ) { }

    async findAll(): Promise<UserEntity[]> {
        const result = await this.userRepository.find();
        const resultMapping = dataMapping("userEntity", result);
        const userEntity = new Array<UserEntity>(resultMapping);
        return userEntity;
    }
    async findOne(username: string): Promise<UserModel> {
        const userResult = await this.userRepository.find({
            where: {
                username: username
            }
        });
        if (userResult.length > 0) {
            const { id, ...result } = userResult[0];
            const resultMapping = dataMapping(UserModel, result);
            const userModel: UserModel = resultMapping;
            return userModel;
        } else {
            return null;
        }
    }

    async findUser(username: string): Promise<UserRepository> {
        const result = await this.userRepository.find({
            where: {
                username: username
            }
        });
        return result[0];
    }
    async findLatestUser(): Promise<UserRepository> {
        const result = await this.userRepository.createQueryBuilder().orderBy("id", "DESC").getOne()
        return result;
    }

    async setUserId(): Promise<string> {
        const latesUser = await this.findLatestUser();
        let newUserId = ''
        if (latesUser.userId != null) {
            const userId = latesUser.userId
            const yearNow = getYear()
            let userPrefix = 'ONI'
            let userYear = userId.slice(3, 7)
            let userRunning = userId.slice(7, 11)
            if (userYear == yearNow.toString()) {
                let number = parseInt(userRunning)
                userRunning = String(number + 1).padStart(4, '0')
            } else {
                userYear = yearNow.toString()
                userRunning = String(1).padStart(4, '0')
            }
            newUserId = userPrefix + userYear + userRunning
        } else {
            let userPrefix = 'ONI'
            let userYear = getYear()
            let userRunning = String(1).padStart(4, '0')
            newUserId = userPrefix + userYear + userRunning
        }

        return newUserId;
    }

    async insertUser(userDto: User): Promise<CommonEntity> {
        const takeTimer = new TakeTimer();
        takeTimer.startTimer()
        const commonEntity = new CommonEntity(new ResultEntity())
        try {
            /**
             * check user is already
             */
            const userAlready = await this.findOne(userDto.username);
            if (userAlready && userAlready.username !== null) {
                // throw new ConflictException('user is already');
                // resultEntity.errorMessage = "User is already";
                // resultEntity.statusCode = HttpStatus.BAD_REQUEST
                // resultEntity.status = false
                commonEntity.result.setError('user is already');
                return commonEntity;
            }
            /**
             * set unique userId
             */
            const newUserId = await this.setUserId();
            /**
             * hash password and set user model
             */
            const hashPassword = bcrypt.hashSync(userDto.password, saltRounds);
            let date = getDateUTC();
            const newUser = new UserRepository();
            newUser.userId = newUserId;
            newUser.username = userDto.username;
            newUser.password = hashPassword;
            newUser.isActive = true;
            newUser.createdBy = userDto.username;
            newUser.createdDate = date;

            const newUserDirectory = new UserDirectory()
            newUserDirectory.email = userDto.username;
            newUserDirectory.userId = newUserId;
            newUserDirectory.createdBy = userDto.username;
            newUserDirectory.createdDate = date;

            let transResult1 = null;
            let transResult2 = null;

            await this.dataSource.transaction(async transactionEntityManager => {
                transResult1 = await transactionEntityManager.save(newUserDirectory)
                newUser.userDirectory = transResult1
                transResult2 = await transactionEntityManager.save(newUser)
            })
            //     .query(`EXEC [oni].[SP_REGISTER_USER] @0, @1, @2, @3`, [userDto.username, `${hashPassword}`, 1, date]);
            // const resultMapping = this.dataMapping(User, userRegistered);
            if (transResult1 && transResult2) {
                // resultEntity.status = true;
                // resultEntity.statusCode = HttpStatus.OK;
                commonEntity.result.setResult()
            }
            return commonEntity;
        } catch (error) {
            // resultEntity.status = false;
            // resultEntity.statusCode = HttpStatus.CONFLICT;
            // resultEntity.errorMessage = err.message;
            commonEntity.result.setException(error.message)
            return commonEntity;
        } finally {
            // resultEntity.methodName = 'insertUser';
            // resultEntity.timeNow = this.getDateUTC();
            commonEntity.result.setFinal('insertUser',await takeTimer.endTimer(),getDateUTC())
            console.log(commonEntity);
            return commonEntity;
        }
    }
    async changePassword(userDto: User): Promise<CommonEntity> {
        /**
         * TODO set timer for
         */
        // let totalSeconds = 0;
        // function setTime() {
        //     totalSeconds = totalSeconds + 1;
        // }
        // var timer = setInterval(setTime, 1000);
        const takeTimer = new TakeTimer();
        takeTimer.startTimer();
        
        const commonEntity = new CommonEntity(new ResultEntity())
        try {
            /**
            * *check user is already
            */
            const userAlready = await this.findUser(userDto.username);
            if (!(userAlready && userAlready.username !== null)) {
                // commonEntity.result.status = false;
                // commonEntity.result.errorMessage = "User is not already";
                // commonEntity.result.statusCode = HttpStatus.BAD_REQUEST;
                commonEntity.result.setError("User is already")
                return commonEntity;
            }
            /**
             * *hash password
             */
            const hashPassword = bcrypt.hashSync(userDto.password, saltRounds);
            userAlready.password = hashPassword;
            const user = await this.userRepository.save(userAlready);
            if (user) {
                // resultEntity.status = true;
                // resultEntity.statusCode = HttpStatus.OK;
                commonEntity.result.setResult()
            }
            return commonEntity;
        } catch (error) {
            // commonEntity.result.errorMessage = error.message;
            // commonEntity.result.status = false;
            // commonEntity.result.statusCode = HttpStatus.CONFLICT;
            commonEntity.result.setException(error.message)
        }
        finally {
            // clearInterval(timer);
            // resultEntity.methodName = 'changePassword';
            // resultEntity.timeNow = getDateUTC();
            // resultEntity.timeUsed = `${totalSeconds} sec`
            commonEntity.result.setFinal('changePassword',await takeTimer.endTimer(),getDateUTC())
            console.log(commonEntity);
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

    async sendEmailForVerifyCode(emailDTO: EmailInterface): Promise<any> {
        const takeTimer = new TakeTimer()
        takeTimer.startTimer()
        // let totalSeconds = 0;
        // function setTime() {
        //     totalSeconds = totalSeconds + 1;
        // }
        // var timer = setInterval(setTime, 1000);
        const commonEntity = new CommonEntity(new ResultEntity());
        try {
            const validEmail = validateEmail(emailDTO.email);
            if (!validEmail) {
                // commonEntity.result.status = false;
                // commonEntity.result.statusCode = HttpStatus.BAD_REQUEST;
                // commonEntity.result.errorMessage = "Email format is incorrect.";
                commonEntity.result.setError("Email format is incorrect.")
                return commonEntity;
            }
            const user = await this.findUser(emailDTO.email)
            if (!user) {
                // commonEntity.result.status = false;
                // commonEntity.result.statusCode = HttpStatus.BAD_REQUEST;
                // commonEntity.result.errorMessage = "Email is not already in system.";
                commonEntity.result.setError("Email is not already in system.")
                return commonEntity;
            }
            const emailResponse = await this.emailService.sendMail(emailDTO.email)
            if (emailResponse) {
                // commonEntity.result.status = true;
                // commonEntity.result.statusCode = HttpStatus.OK;
                commonEntity.result.setResult()
            }
            return commonEntity;
        } catch (error) {
            // commonEntity.result.status = true;
            // commonEntity.result.statusCode = HttpStatus.CONFLICT;
            // commonEntity.result.errorMessage = error.message;
            commonEntity.result.setException(error.message)
            return commonEntity;
        } finally {
            // clearInterval(timer)
            // commonEntity.result.methodName = 'sendEmailForVerifyCode';
            // commonEntity.result.timeNow = getDateUTC()
            // commonEntity.result.timeUsed = `${totalSeconds} sec`
            
            commonEntity.result.setFinal('sendEmailForVerifyCode',await takeTimer.endTimer(),getDateUTC())
            console.log(commonEntity)
        }
    }

    async getLogVerifyCode(email: string): Promise<any> {
        const response = await this.emailService.getLogVerifyCode(email)
        return response;
    }

    async validateVerifyCode(emailDTO: EmailInterface): Promise<any> {
        /**
         * TODO set timer for
         */
        // let totalSeconds = 0;
        // function setTime() {
        //     totalSeconds = totalSeconds + 1;
        // }
        // var timer = setInterval(setTime, 1000);
        const takeTimer = new TakeTimer();
        takeTimer.startTimer();

        const commonEntity = new CommonEntity(new ResultEntity());
        try {
            const verifyCode = await this.emailService.getLogVerifyCode(emailDTO.email);
            if (emailDTO.verifyCode == verifyCode) {
                // resultEntity.status = true;
                commonEntity.result.setResult()
            } else {
                // resultEntity.status = false;
                // resultEntity.statusCode = HttpStatus.BAD_REQUEST;
                // resultEntity.errorMessage = 'VerifyCode is invalid';
                commonEntity.result.setError('VerifyCode is invalid')
            }
            return commonEntity;
        } catch (error) {
            // resultEntity.status = false;
            // resultEntity.statusCode = HttpStatus.CONFLICT;
            // resultEntity.errorMessage = error.message;
            commonEntity.result.setException(error.message)
            return commonEntity;
        } finally {
            // clearInterval(timer);
            // resultEntity.methodName = 'validateVerifyCode';
            // resultEntity.timeNow = getDateUTC();
            // resultEntity.timeUsed = `${totalSeconds} sec`;
            commonEntity.result.setFinal('',await takeTimer.endTimer(),getDateUTC())
            console.log(commonEntity)   
        }
    }

    async findUserDirectory(userId: string): Promise<UserDirectory> {
        const userDirectories = await this.userdirectoryRepository.findOne({
            where: {
                userId: userId
            }
        })
        return userDirectories
    }
    async getUserDirectory(userId: string): Promise<UserDirectoryEntity> {
        // *start timer for count time used task getUserDirectory
        const takeTimer = new TakeTimer();
        takeTimer.startTimer();
        const userDirectoryEntity = new UserDirectoryEntity()
        const resultEntity = new ResultEntity();
        try {
            const userDirectory = await this.findUserDirectory(userId)
            if (!userDirectory) {
                resultEntity.setError(`user not found`)
                // resultEntity.errorMessage = 'Not user found';
                // resultEntity.status = false;
                // resultEntity.statusCode = HttpStatus.BAD_REQUEST;
            }
            const resultMapping = await dataMapping(UserDirectoryModel, userDirectory);
            userDirectoryEntity.userDirectory = resultMapping;
            resultEntity.setResult();
            // userDirectoryEntity.result.status = true;
            // userDirectoryEntity.result.statusCode = HttpStatus.OK;
        } catch (error) {
            resultEntity.setException(error.message)
            // userDirectoryEntity.result.status = false;
            // userDirectoryEntity.result.statusCode = HttpStatus.CONFLICT;
            // userDirectoryEntity.result.errorMessage = error.message;
        } finally {

            resultEntity.setFinal('getUserDirectory', await takeTimer.endTimer(), getDateUTC())
            userDirectoryEntity.result = resultEntity;
            // userDirectoryEntity.result.methodName = 'getUserDirectory';
            // userDirectoryEntity.result.timeNow = this.getDateUTC();
            // const timeUsed = await takeTimer.endTimer();
            // userDirectoryEntity.result.timeUsed = `${timeUsed} sec`;
            // console.log(userDirectoryEntity);
            console.log(userDirectoryEntity);
            return userDirectoryEntity;
        }
    }

    async updateUserDirectory(userId: string, updateUserDto: updateUserDto) {
        const userDirectory = await this.findUserDirectory(userId);
        userDirectory.firstname = updateUserDto.firstname;
        userDirectory.lastname = updateUserDto.lastname;
        userDirectory.phone = updateUserDto.phone;
        const result = this.userdirectoryRepository.save(userDirectory)
        return result;
    }

    private comparePassword = async (password: string, existPassword: string) => {

        const isPasswordCorrect = await bcrypt.compare(password, existPassword);
        return isPasswordCorrect;
    }

}

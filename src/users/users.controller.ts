import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, updateUserDto } from './interfaces/user.interface';
import { UserDirectoryEntity, UserDirectoryModel, UserEntity, UserModel } from './Entities/userEntity';
import { EmailInterface } from 'src/email/interfaces/email.interface';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { UserRepository } from './Repositories/userRepository.entity';
import { UserDirectory } from './Repositories/userDirectory.entity';
import { TakeTimer } from 'src/common/utils/timer';
import { resolve } from 'path';

@Controller('users')
export class UsersController {
constructor(private userService: UsersService){}

    @Post('sendEmailForVerifyCode')
    async sendEmailForVerifyCode(@Body() dto : EmailInterface): Promise<any>{
      const result = await this.userService.sendEmailForVerifyCode(dto);
      return result;
    }

    @Post('validateVerifyCode')
    async validateVerifyCode(@Body() dto : EmailInterface): Promise<any>{
      const result = await this.userService.validateVerifyCode(dto);
      return result;
    }

    @UseGuards(AuthGuard)
    @Get('getUserDirectory')
    async getUserDirectory(@Request() req ){
      const user = req.user
      const result = await this.userService.getUserDirectory(user.id)
      return result;
    }

    @UseGuards(AuthGuard)
    @Patch('updateUserDirectory')
    async updateUserDirectory(@Request() req ,@Body() updateUserDto: updateUserDto){
      const user = req.user;
      const result = await this.userService.updateUserDirectory(user.id,updateUserDto)
      return result;
    }

    /**
     * ! deprecated method : do not use : it's for test
     */

    /**
     * *test mapping 
     */
    //#region test mapping
    // @Get('health')
    // async health(): Promise<UserDirectoryEntity> {
    //     let userdirectory = new UserDirectory;
    //     userdirectory.firstname = 'test'
    //     userdirectory.lastname = 'testlast'
    //     let userDirectories = [];
    //     userDirectories.push(userdirectory)
    //     const result = await this.userService.dataListMapping(UserDirectoryModel,userDirectories);
    //     let listUserDirectoryEntity = new UserDirectoryEntity()
    //     listUserDirectoryEntity.userDirectories = result;
    //     return listUserDirectoryEntity;
    // }
    //#endregion test mapping

    /**
     * *test timer
     */
    //#region test timer
    @Get('health')
    async health(): Promise<string> {
      const takeTimer = new TakeTimer()
      takeTimer.startTimer()
      let timeused: number

      function timeout(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      await timeout(5000)

      timeused = await takeTimer.endTimer()
      console.log(`timeused : ${timeused}`)
      return `timeused : ${timeused}`
    }
    //#endregion test timer
    

    @Get('getAllUser')
    async findAll(): Promise<UserEntity[]>{
        const users = this.userService.findAll();
        return users;
    }

    @Post('getOneUser')
    async findOne(@Body()userDto: User): Promise<UserModel>{
        const user = this.userService.findOne(userDto.username);
        return user;
    }

    @Get('getLatestUser')
    async getLatestUser(): Promise<any>{
      const user = await this.userService.setUserId();
      return user;
    }
}

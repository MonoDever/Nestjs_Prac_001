import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';
import { UserEntity } from './Entities/userEntity';

@Controller('users')
export class UsersController {
constructor(private userService: UsersService){}

    @Post('sendEmailForVerifyCode')
    async sendEmailForVerifyCode(): Promise<any>{
      const result = await this.userService.sendEmailForVerifyCode("test");
      return result;
    }

    @Get('health')
    health(): string {
        return "this is users";
    }

    @Get('getAllUser')
    async findAll(): Promise<UserEntity[]>{
        const users = this.userService.findAll();
        return users;
    }

    @Post('getOneUser')
    async findOne(@Body()userDto: User): Promise<UserEntity>{
        const user = this.userService.findOne(userDto.username);
        return user;
    }

    @Post('getdata')// main work
  async getData(@Body()data: any) {
    const listItem = data.pr
    const listPo = data.po
    const listObj = []
    const listpurePO = []
    let obj = null
    let havepo  = null

    listItem.forEach((item, index) => {
      listPo.forEach(po => {
        if (item == po.BANFN) {
          if (po.LOEKZ == undefined) {
            obj = null;
            obj = {pr:null,po:null,popr:null}
            obj.pr = item,
              obj.po = po.EBELN
              obj.popr = po.BANFN
              havepo = null
            havepo =  listObj.find(item => item.pr == obj.pr)
            if(havepo == undefined){
                listObj.push(obj) 
                listpurePO.push(obj.po)
            }
            return;
          }
        }
      });
    });
    // listItem.forEach((item, index) => {
    //     listPo.forEach(po => {
    //       if (item == po.BANFN) {
    //         if (po.LOEKZ == undefined) {
    //           obj = null;
    //           obj = {pr:null,po:null,popr:null}
    //           obj.pr = item,
    //             obj.po = po.KONNR
    //             obj.popr = po.BANFN
    //             havepo = null
    //           havepo =  listObj.find(item => item.pr == obj.pr)
    //           if(havepo == undefined){
    //               listObj.push(obj) 
    //           }
    //           return;
    //         }
    //       }
    //     });
    //   });


    console.log(JSON.stringify(listObj))
    return {listObj,listpurePO}

  }
}

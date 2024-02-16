import { ResultEntity } from "src/common/entities/resultEntity";

export class UserEntity {
    constructor(){
        this.result = new ResultEntity();
    }
    userId?: string = null;
    username?: string= null;
    password: string= null;
    isActive: boolean= null;
    // createdBy: string;
    // createdDate: Date;
    // updatedBy: string;
    // updatedDate: Date;
    userInfo: UserInformationEntity;
    auth: AuthenEntity;
    result: ResultEntity;
}
export class UserInformationEntity{
    firstname: string;
    lastname: string;
    age: number;
    email: string;
    address: string;
    mobile: string;
}
export class AuthenEntity{
    token: string;
    refreshtoken: string;
}
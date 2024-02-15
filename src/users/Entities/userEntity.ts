import { resultentity } from "src/common/resultentity";

export class UserEntity {
    constructor(){
        this.result = new resultentity();
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
    result: resultentity;
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
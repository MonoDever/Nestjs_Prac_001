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
    auth: AuthenEntity;
    result: ResultEntity;
}
export class AuthenEntity{
    token: string;
    refreshtoken: string;
}
export class UserDirectoryModel{
    firstname: string = null;
    lastname: string = null;
    age: number;
    email: string = null;
    address: string;
    phone: string = null;
}
export class UserDirectoryEntity{
    constructor(){
        this.result = new ResultEntity()
    }
    userDirectories: Array<UserDirectoryModel> = []
    userDirectory: UserDirectoryModel; 
    result: ResultEntity;
}
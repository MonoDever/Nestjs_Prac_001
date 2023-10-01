export class UserEntity {
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
export interface User {
    userId: string;
    username: string;
    password: string;
    refresh: string;
    isActive: boolean;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}

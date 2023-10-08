import { ApiProperty } from "@nestjs/swagger";
export class User {
    @ApiProperty()
    userId: string;
    @ApiProperty()
    username: string;
    @ApiProperty()
    password: string;
    refresh: string;
    isActive: boolean;
    createdBy: string;
    createdDate: Date;
    updatedBy: string;
    updatedDate: Date;
}

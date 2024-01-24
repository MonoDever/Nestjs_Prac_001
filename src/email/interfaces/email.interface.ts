import { ApiProperty } from "@nestjs/swagger";

export class EmailInterface{
    @ApiProperty()
    email: string;
    @ApiProperty()
    verifyCode: string;
}
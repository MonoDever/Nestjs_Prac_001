import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './repositories/emailTemplate.entity';
import { SentEmailLog } from './repositories/sentEmailLog.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EmailTemplate]),TypeOrmModule.forFeature([SentEmailLog])],
    providers: [EmailService],
    exports: [EmailService]
})
export class EmailModule { }

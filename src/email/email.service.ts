import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from './repositories/emailTemplate.entity';
import { SentEmailLog } from './repositories/sentEmailLog.entity';
import { setDateUTC } from 'src/common/utility';

const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "practice.practice003@gmail.com",
        pass: "chypumywfvjyozkn"
    }
})

@Injectable()
export class EmailService {
    constructor(
        @InjectRepository(EmailTemplate)
        private readonly emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(SentEmailLog)
        private readonly sentEmailLogRepository: Repository<SentEmailLog>,
    ) { }

    async sendMail(email: string): Promise<any> {
        try {
            /**
             * get email template
             */
            const mailBody = await this.emailTemplateRepository.find({
                where: { templateId: 'VER001' }
            });
            /**
             * Generate
            */
            let code = Math.floor(100000 + Math.random() * 900000)
            /***
             * Replacement
            */
            let mailSubjectTemplate = "";
            let mailBodyTemplate = "";
            if (mailBody.length > 0) {
                mailSubjectTemplate = mailBody[0].mailSubject
                mailBodyTemplate = mailBody[0].mailBody
                mailBodyTemplate = mailBodyTemplate.replaceAll("{FIRSTNAME}", email)
                mailBodyTemplate = mailBodyTemplate.replaceAll("{EMAIL}", email)
                mailBodyTemplate = mailBodyTemplate.replaceAll("{VERIFYCODE}", code.toString())
                mailSubjectTemplate = mailSubjectTemplate
            }
            /**
             * Sendmail
            */
            const info = await transporter.sendMail({
                from: "practice.practice003@gmail.com",
                to: email,
                subject: mailSubjectTemplate,
                text: "Hello world?",
                html: mailBodyTemplate
            })
            /**
             * Insert log
            */
            if (info.messageId) {
                const dateNow = await setDateUTC();
                const sentEmailLogModel = new SentEmailLog()
                sentEmailLogModel.mailTo = email;
                sentEmailLogModel.mailSubject = mailSubjectTemplate;
                sentEmailLogModel.mailBody = mailBodyTemplate;
                sentEmailLogModel.templateId = "VER001";
                sentEmailLogModel.verifyCode = code.toString();
                sentEmailLogModel.sentDate = dateNow;
                sentEmailLogModel.createdDate = dateNow;
                sentEmailLogModel.createdBy = email;
                const log = await this.sentEmailLogRepository.save(sentEmailLogModel)
                console.log("Message sent: ", info.messageId);
            }
            return info.messageId
        } catch (error) {
            return null;
        }
    }

    async getLogVerifyCode(email: string): Promise<any> {
        const code = await this.sentEmailLogRepository.find({
            where: {
                mailTo: email
            },
            order: {
                id: "DESC"
            }
        })
        if (code) {

        }
        return code[0].verifyCode;
    }
}

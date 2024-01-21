import { Injectable } from '@nestjs/common';

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

const mailBody = `<div>
<table border="0" cellspacing="0" cellpadding="0" style="max-width:600px;">
    <tbody>
        <tr>
            <td>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                            <td align="left"><img data-imagetype="External"
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpYinMp9sWFJtvQTKsbzHWHjSAeahAdZIBFA&usqp=CAU"
                                    width="92" height="32" style="display:block; width:92px; height:32px"></td>
                            <td align="right"><img data-imagetype="External"
                                    src="https://ssl.gstatic.com/accountalerts/email/keyhole.png" width="32"
                                    height="32" style="display:block; width:32px; height:32px"></td>
                        </tr>

                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                        <tr>
                            <td>
                                <div style="
                                background-color: lightblue;
                                height: 100px;
                                display: flex;
                                ">
                                    <h1 style="align-self: flex-end;margin: 10px;color:white">รหัสยืนยันของ Onigiri
                                    </h1>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <table bgcolor="#FAFAFA" width="100%" border="0" cellspacing="0" cellpadding="0"
                    style="min-width:332px; max-width:600px; border:1px solid #F0F0F0; border-bottom:1px solid #C0C0C0; border-top:0; border-bottom-left-radius:3px; border-bottom-right-radius:3px">
                    <tbody>
                        <tr height="16px">
                            <td width="32px" rowspan="3"></td>
                            <td></td>
                            <td width="32px" rowspan="3"></td>
                        </tr>
                        <tr>
                            <td>
                                <p>สวัสดี คุณ {FIRSTNAME}</p>
                                <p>เราได้รับคำขอเข้าถึงบัญชี Onigiri <span dir="ltr"
                                        style="color:#659CEF">{EMAIL}</span> ผ่านที่อยู่อีเมลของคุณ
                                    รหัสยืนยัน Onigiri ของคุณคือ:</p>
                                <div style="text-align:center">
                                    <p dir="ltr"><strong
                                            style="text-align:center; font-size:24px; font-weight:bold">{VERIFYCODE}</strong>
                                    </p>
                                </div>
                                <p>หากคุณไม่ได้ขอรหัสนี้ เป็นไปได้ว่ามีคนอื่นพยายามเข้าถึงบัญชี Onigiri} <span
                                        dir="ltr" style="color:#659CEF">{EMAIL}</span>
                                    <strong>อย่าส่งต่อหรือมอบรหัสนี้ให้ใคร</strong></p>

                                <p>ขอแสดงความนับถือ</p>
                                <p>ทีม Onigiri</p>
                            </td>
                        </tr>
                        <tr height="32px"></tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
</table>
</div>`


@Injectable()
export class EmailService {

    async sendMail(email : string) : Promise<any>{
        const info = await transporter.sendMail({
            form: "practice.practice003@gmail.com",
            to: 'monorunza@gmail.com',
            subject: "HELLO nest",
            text: "Hello world?",
            html: mailBody
        })
        console.log("Message sent: %s", info.messageId);
        return info.messageId
    }
}

import { Injectable } from "@nestjs/common";
import Mailgun from "mailgun.js";
import * as FormData from "form-data";

@Injectable()
export class MailgunService{
    private mailgunClient;

    constructor(){
        const mailgun = new Mailgun(FormData);
        this.mailgunClient = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY,
        });
        
    }

    async sendEmail(to: string , subject: string, text: string , html?: string){
        try{
            const res = await this.mailgunClient.messages.create(
                process.env.MAILGUN_DOMAIN,
                {
                    from: `Unicon <noreply@${process.env.MAILGUN_DOMAIN}>`,
                    to: [to],
                    subject,
                    text,
                    html,
                },
            );
           
            return res;
        } catch(error){
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

 async sendVerificationEmail(to: string ,verificationToken: string){

    const verificationlink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`;

    const subject = 'Unicon Verification';
    const text = `Click the link to verify your email: ${verificationlink}`;
    const html = `
        <html>
        <body>
            <p>Click the link below to verify your email address:</p>
            <a href="${verificationlink}" style="color: #4CAF50; text-decoration: none; font-size: 16px;">Verify Email</a>
        </body>
        </html>
    `;
    return await this.sendEmail(to, subject, text, html);

 }
    
}
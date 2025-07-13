const nodemailer = require('nodemailer')

module.exports = async (to , subject , text)=>{
    const transporter = nodemailer.createTransport({
        service:"Gmail",
        auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.Email_PASS,
        
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    })
}
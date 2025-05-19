import nodemailer from "nodemailer"
export const transportmail=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.password
    },
    port:465,
    secure:false,
    host:'smtp.gmail.com'
})
export const sendemail=(email:string,data:string)=>{
    const verifyotp = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Your Message',
        html:data
    };
    
transportmail.sendMail(verifyotp,(err:any,info:any)=>{
    if(info){
         console.log(info);
    //    return res.status(200).send({message:"OTP sent please verify to complete registration"})
    }else{
     console.log(err);
    }
})
}

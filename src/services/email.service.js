import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({

  service: 'gmail',

  auth: {

    user: process.env.EMAIL_USER,

    pass: process.env.EMAIL_PASS

  }

});

// Verify transporter configuration
transporter.verify((error, success) => {

  if(error){
    console.log("Error configuring email transporter:", error);
  }

  else{
    console.log("Email transporter is ready to send emails");
  }

});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {

  try {

    const info = await transporter.sendMail({

      from: `"Tekchand Backend" <${process.env.EMAIL_USER}>`,

      to: to,

      subject: subject,

      text: text,

      html: html

    });

    console.log("Message sent:", info.messageId);

  }

  catch(error){

    console.log("Error sending email:", error);

  }

};
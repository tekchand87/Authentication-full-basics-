export function generateOtp(){
  return Math.floor(100000 + Math.random()*900000).toString();
}

export function getOtpHtml(otp){
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      body{
        font-family : Arial, sans-serif;
        background-color : #f4f4f4;
        padding : 20px;
      }
      h1{
        color : #333;
      }
    </style>  
  </head>
  <body>
    <h2>OTP Verification</h2>
    <h1>Your OTP is ${otp}</h1>   
  </body>
  </html>`
}

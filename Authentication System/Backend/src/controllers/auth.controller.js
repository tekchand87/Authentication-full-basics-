import userModel from '../models/user.models.js'
import crypto from 'crypto'
import config from '../config/config.js'
import jwt from "jsonwebtoken"
import sessionModel from '../models/session.model.js'
import {sendEmail} from '../services/email.service.js'
import {generateOtp,getOtpHtml} from '../utils/utils.js'
import otpModel from '../models/opt.model.js'


export async function register(req,res){
  const {username,email,password} = req.body;
  const isAlreadyRegistered = await userModel.findOne({
    $or: [
      {username},
      {email}
    ]
  })

  if(isAlreadyRegistered){
    return res.status(409).json({
      message : "user name or email is already exist"
    })
  }
  const hashedpassword = crypto.createHash("sha256").update(password).digest("hex");

  const user = await userModel.create({
    username,
    email,
    password : hashedpassword
  })

  const otp = generateOtp();

  const html = getOtpHtml(otp);

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  await otpModel.create({
    email,
    user : user._id,
    otpHash,
    expiresAt : Date.now() + 10*60*1000 // 10 minutes
  })  
  await sendEmail(email,"OTP Verification",`Your OTP is ${otp}`,html);


  res.status(201).json({
    message : "User registered succesfully",
    user : {
      username : user.username,
      email : user.email,
      verified : user.verified
    }
  })
}

export async function login(req,res){
  const {email,password} = req.body;

  const user = await userModel.findOne({
    email
  })

  if(!user){
    return res.status(401).json({
      message : "Invalid email or password"
    }) 
  }

  if(!user.verified){
    return res.status(401).json({
      message : "Please verify your email to login "
    })
  }
  const hashedpasswords = crypto.createHash("sha256").update(password).digest("hex");

  const isPasswordValid = hashedpasswords === user.password;

  if(!isPasswordValid){
    return res.status(401).json({
      message : "Invalid email or password"
    })
  }

  const refreshtoken = jwt.sign({
    id : user._id,
  },config.JWT_SECRET,{
    expiresIn : "7d"
  })

  const refreshtokneHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

  const session = await sessionModel.create({
    user : user._id,
    refreshTokenHash : refreshtokneHash,
    ip : req.ip,
    userAgent : req.headers['user-agent']
  })

  const accesstoken = jwt.sign({
    id : user._id,
    sessionID : session._id
  },config.JWT_SECRET,{
    expiresIn : "15m"
  })

  res.cookie("refreshtoken",refreshtoken,{
    httpOnly : true,
    secure : true,
    sameSite : "strict",
    maxAge : 7*24*60*60*1000 // 7 days 
  })

  return res.status(200).json({
    message : "logged in successfully",
    user : {
      username : user.username,
      email : user.email
    },
    accesstoken
  })
}

export async function getMe(req,res){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token){
    return res.status(401).json({
      message : "Token not found"
    })
  }

  
  const decoded = jwt.verify(token,config.JWT_SECRET);
  //console(decoded)
  const user = await userModel.findById(decoded.id);

  res.status(200).json({
    message : "User fetched successfully",
    user :{
      username : user.username,
      email : user.email
    }
  })
}

export async function refreshToken(req,res){

  const refreshtoken = req.cookies.refreshtoken;
  if(!refreshtoken){
    return res.status(401).json({
      message : "Refresh token not found"
    })
  }

  const decoded = jwt.verify(refreshtoken,config.JWT_SECRET);

  const refreshtokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");

  const session = await sessionModel.findOne({
    refreshTokenHash : refreshtokenHash,
    revoked : false
  })

  if(!session){
    return res.status(401).json({
      message : "Invalid refresh token"
    })
  }
  const accessToken = jwt.sign({
    id : decoded.id,
  },config.JWT_SECRET,{
    expiresIn : "15m"
  })

  const newRefreshToken = jwt.sign({
    id : decoded.id,
  },config.JWT_SECRET,{
    expiresIn : "7d"
  })
  
  const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

  session.refreshTokenHash = newRefreshTokenHash; 
  await session.save();
  
  res.cookie("refreshtoken",newRefreshToken,{
    httpOnly : true,
    secure : true,
    sameSite : "none",
    maxAge : 7*24*60*60*1000 // 7 days
  })

  res.status(200).json({
    message : "Access token refreshed successfully",
    accesstoken : accessToken
  })
}

export async function logout(req,res){
  const refreshtoken = req.cookies.refreshtoken;

  if(!refreshtoken){
    return res.status(401).json({
      message : "Refresh token not found"
    })
  }

  const refreshtokenHash = crypto.createHash('sha256').update(refreshtoken).digest('hex');

  const session = await sessionModel.findOne({
    refreshTokenHash : refreshtokenHash,
    revoked : false
  })

  if(!session){
    return res.status(401).json({
      message : "Invalid refresh token"
    })
  }

  session.revoked = true;
  await session.save();

  res.clearCookie("refreshtoken")

  res.status(200).json({
    message : "Logged out successfully"
  })


}

export async function logoutAll(req,res){
  const refreshToken = req.cookies.refreshtoken;
  
  if(!refreshToken){
    return res.status(401).json({
      message : "Refresh token not found"
    })
  };

  const decoded = jwt.verify(refreshToken,config.JWT_SECRET);

  await sessionModel.updateMany({
    user : decoded.id,
    revoked : false
  },{
    revoked : true
  });

  res.clearCookie("refreshtoken");

  res.status(200).json({
    message : "logged out from all devices successfully"
  })
}

export async function verifyEmail(req,res){
  const {email,otp} = req.body;

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  const otpRecord = await otpModel.findOne({
    email,
    otpHash,
    expiresAt : {$gt : Date.now()}
  })

  if(!otpRecord){
    return res.status(400).json({
      message : "Invalid or expired OTP"
    })
  }
  
  const user = await userModel.findById(otpRecord.user);  
  if(!user){
    return res.status(400).json({
      message : "User not found"
    })
  }
  user.verified = true;
  await user.save();
  await otpModel.deleteMany({
    email
  })

  res.status(200).json({
    message : "Email verified successfully",
    user : {
      username : user.username,
      email : user.email,
      verified : user.verified
    }     
  })  
}
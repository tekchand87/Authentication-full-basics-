import userModel from '../models/user.models.js'
import crypto from 'crypto'
import config from '../config/config.js'
import jwt from "jsonwebtoken"
import sessionModel from '../models/session.model.js'

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

  const refreshtoken = jwt.sign({
    id: user._id,
  },config.JWT_SECRET,{
    expiresIn : "7d"
  })

  const refreshtokenHash = crypto.createHash("sha256").update(refreshtoken).digest("hex");
  const session = await sessionModel.create({
    user : user._id,
    refreshTokenHash: refreshtokenHash,
    ip : req.ip,
    userAgent : req.headers['user-agent']
  })


  const accesstoken = jwt.sign({
    id: user._id,
    sessionID : session._id
  },config.JWT_SECRET,{
    expiresIn : "15m"
  })

  

  res.cookie("refreshtoken",refreshtoken,{
    httpOnly : true,
    secure : true,
    sameSite : "none",
    maxAge : 7*24*60*60*1000 // 7 days
  })
  res.status(201).json({
    message : "User registered succesfully",
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

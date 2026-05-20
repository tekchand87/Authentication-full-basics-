import mongoose from 'mongoose';

const sessionSchmea = new mongoose.Schema({
  user :{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : true
  },
  refreshTokenHash : {
    type : String,
    required : [true,"Refresh token is required"]
  },
  ip : {
    type : String,
    required : [true,'IP address is reauired']
  },
  userAgent : {
    type : String,
    required : [true,'User agent is required']
  },
  revoked : {
    type : String , 
    default : false
  },
},{
  timestamps : true
})

const sessionModel = mongoose.model('session',sessionSchmea);

export default sessionModel;
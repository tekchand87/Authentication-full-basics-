import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email : {
    type : String,
    required : [true,"email is required"],
  },
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : [true,"user is required"]
  },
  otpHash :
  {
    type : String,
    required : [true,"otpHash is required"]
  },
},{
  timestamps : true
})

const otpModel = mongoose.model("OTP",otpSchema);

export default otpModel;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
      type : String,
      requried :[true,'Username is required'],
      unqiue : [true,'Username must be unique']
    },
    email : {
      type : String,
      required : [true,'Email is required'],
      unqiue : [true,'Email must be unqiue']
    },
    password : {
      type : String,
      required : [true,'Password must be required']
    },
    verified : {
      type : Boolean ,
      default : false
    }
})

const userModel = mongoose.model('users',userSchema);

export default userModel;
import dotenv from 'dotenv';

dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI is not defined in environment variables');
}

if(!process.env.JWT_SECRET){
  throw new Error('JWT SECRETS is not defined in enviroment variables')
}

if(!process.env.google_client_id){
  throw new Error('Google client id is not defined in enviroment variables')
}

if(!process.env.google_client_secret){
  throw new Error("Google client secret is not defined in enviroment variables")
}

if(!process.env.google_refresh_token){
  throw new Error("google refresh token is not define in enviroment variables")
}

if(!process.env.google_user){
  throw new Error("google user is not define in enviroment variables")
}
const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET : process.env.JWT_SECRET,
  google_client_id : process.env.google_client_id,
  google_client_secret : process.env.google_client_secret,
  google_refresh_token : process.env.google_refresh_token,
  google_user : process.env.google_user
};
export default config;
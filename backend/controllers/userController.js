import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const registerControllers = async (req, res, next) => {
    try{
        console.log('🚀 Registration attempt started');
        console.log('Request body:', req.body);
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        // Wait for database connection if not connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise((resolve, reject) => {
                if (mongoose.connection.readyState === 1) {
                    resolve();
                } else {
                    mongoose.connection.once('connected', resolve);
                    mongoose.connection.once('error', reject);
                    // Timeout after 10 seconds
                    setTimeout(() => reject(new Error('Database connection timeout')), 25000);
                }
            });
            console.log('✅ Database connected!');
        }
        
        const {name, email, password} = req.body;

        console.log('Extracted data:', {name, email, password: password ? '[HIDDEN]' : 'undefined'});

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }) 
        }

        let user = await User.findOne({email});

        if(user){
            return res.status(409).json({
                success: false,
                message: "User already Exists",
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        // console.log(hashedPassword);

        let newUser = await User.create({
            name, 
            email, 
            password: hashedPassword, 
        });

        return res.status(200).json({
            success: true,
            message: "User Created Successfully",
            user: newUser
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }

}
export const loginControllers = async (req, res, next) => {
    try{
        console.log('🔑 Login attempt started');
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        // Wait for database connection if not connected
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise((resolve, reject) => {
                if (mongoose.connection.readyState === 1) {
                    resolve();
                } else {
                    mongoose.connection.once('connected', resolve);
                    mongoose.connection.once('error', reject);
                    setTimeout(() => reject(new Error('Database connection timeout')), 25000);
                }
            });
            console.log('✅ Database connected!');
        }
        
        const { email, password } = req.body;

        // console.log(email, password);
  
        if (!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please enter All Fields",
            }); 
        }
    
        const user = await User.findOne({ email });
    
        if (!user){
            return res.status(401).json({
                success: false,
                message: "User not found",
            }); 
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch){
            return res.status(401).json({
                success: false,
                message: "Incorrect Email or Password",
            }); 
        }

        delete user.password;

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${user.name}`,
            user,
        });

    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

export const setAvatarController = async (req, res, next)=> {
    try{

        const userId = req.params.id;
       
        const imageData = req.body.image;
      
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: imageData,
        },
        { new: true });

        return res.status(200).json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatarImage,
          });


    }catch(err){
        next(err);
    }
}

export const allUsers = async (req, res, next) => {
    try{
        const user = await User.find({_id: {$ne: req.params.id}}).select([
            "email",
            "username",
            "avatarImage",
            "_id",
        ]);

        return res.json(user);
    }
    catch(err){
        next(err);
    }
}
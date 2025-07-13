const User =  require('../models/user.model')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendMail = require('../utils/sendEmail');
const { error } = require('console');

// here we are generating the token with Exipire

const generateToken =  (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{expiresIn:'1h'});
}

  // singUp Functionality 

exports.signUp  =  async (req,res)=>{
    try {
        const {firstName,lastName,email,password} = req.body;
        const user = await User.create({firstName,lastName,email,password});
        res.status(201).json({message:"User Created Success fully",userId : user._id}); 
    } catch (error) {
        res.status(400).json({error:error.message})
    }
}

  // login Functionality  write it here 

exports.login = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const user =  await User.findOne({email});
        if(!user || !(await user.correctPassword(password,user.password))){
            return res.status(400).json({message:"invalid user & Password"})
        }
        const token = generateToken(user._id)
        res.json({token, message:"user Loged in Successful"})
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

  // get The Use User 
exports.getUser =  async (req,res)=>{
    try {
        const user = User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

 // Forget The Password 

exports.forgotPassword = async (req,res)=>{
    try {
        const user = User.findOne({email:req.body.email});
        if (!user) return res.status(404).json({error:"This User is Not Exist"}) 
            const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = crypto.createHash("sha256").update(resetToken).digest('hex')
        user.resetTokenExpiration = Date.now() + 5* 60 * 1000  // here we are defining the Date here 
        await user.save()
        const resetUrl =  `http://localhost:3000/reset-password/${resetToken}`
        await sendMail(user.email, "Rest Password", `Rest Your Password: ${resetUrl} `)
        res.json({message:"Rest Link Sent to your Email"})
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

 // Rest The Password

exports.resetPassword = async(req,res)=>{
    try {
        const hasedToken = crypto.createHash("sha256").update(req.params.token).digest('hex')
        const user = await User.findOne({
            resetToken: hasedToken,
            resetTokenExpiration:{$gt: Date.now()},
        });
        if(!user) return res.status(404).json({message:"Invalid Tokens or Expired..."})

            user.password = req.body.password;
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined
            await user.save();
            res.json({message:"password Updated success fully"})
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
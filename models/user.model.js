const mongoose = require('mongoose')
const bcrypt = require('bcrypt')


const userScema = new mongoose.Schema({
        firstName: String,
        lastName:String,
        email:{type:String,unique:true},
        password:String,
        resetToken:String,
        resetTokenExpiration:Date
})

// Encrypt Password Before Save 

userScema.pre("save",async function (next) {
    if (this.isModified("password")) return next();
    this.password =  await bcrypt.hash(this.password,10);
})

// check password and Comare of them 

userScema.methods.correctPassword = async function (candidatePassword,userPassword){
     return await bcrypt.compare(candidatePassword,userPassword)
}

module.exports = mongoose.model("user",userScema);
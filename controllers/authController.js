const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// const { error } = require('console');

// here we are generating the token with Exipire

const generateToken =  (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{expiresIn:'1h'});
}

  // singUp Functionality 

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({ firstName, lastName, email, password });
    res.status(201).json({ message: "User created", userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

  // login Functionality  write it here 

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = generateToken(user._id);
    res.json({ token, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

  // get The Use User 
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 // Forget The Password 

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetTokenExpiration = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    const resetUrl = `http://yourfrontend.com/reset-password/${resetToken}`;
    await sendEmail(user.email, "Reset Password", `Reset your password: ${resetUrl}`);

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 // Rest The Password

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: "Token is invalid or expired" });

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
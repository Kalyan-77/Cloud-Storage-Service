const express = require('express');
const bcrypt = require('bcrypt');
const Users = require('../Models/Users');

const router = express.Router();

//Register
exports.register = async (req, res)=>{
    const {name, email, password} = req.body;

    try{
        if(!name || !email || !password){
            return res.status(400).json({error: 'All fields are required'});
        }

        const existsEmail = await Users.findOne({email});
        if(existsEmail){
            return res.status(400).json({error: 'Email Already Exists!!'});
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await Users.create({name, email, password:hashedPassword});
        
        // Return user without password but with timestamps
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        return res.status(201).json({message: 'User Registered Successfully', user: userResponse});
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server Error....'});
    }
};

//Login
exports.login = async(req, res) =>{
    const {email, password} = req.body;

    console.log(req.body);

    try{
        const user = await Users.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        // Store complete user data in session including timestamps
        req.session.userId = user._id;
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,    // Add this
            updatedAt: user.updatedAt     // Add this
        };

        return res.json({ 
            message: 'Login Successfull',
            success: true,
            user: req.session.user  // Return user data with timestamps
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({error: 'Something Went Wrong....'});
    }
}

//Get User by id
exports.getUserById = async(req, res) =>{
    const {id} = req.params;

    try{
        const user = await Users.findById(id).select("-password");
        if(!user){
            return res.status(400).json({message: 'Invalid User Id'});
        }
        res.status(200).json({ 
            success: true,
            message: "User fetched successfully", 
            user 
        });
    }catch(err){
        console.error(err);
        res.status(500).json({message: "Server Error", error: err.message })
    }
}

//Update User
exports.UpdateUser = async(req, res) =>{
    const {id} = req.params;
    const {name, email, password} = req.body;
    try{
        const updatedData = {};

        if(name) updatedData.name = name;
        if(email) updatedData.email = email;
        if(password){
            updatedData.password = await bcrypt.hash(password,10);
        }

        const user = await Users.findByIdAndUpdate(id, updatedData, {new: true}).select("-password");
        if(!user){
            return res.status(400).json({message: 'Invalid User Id'});
        }
        
        // Update session with new user data
        if(req.session && req.session.user && req.session.user._id.toString() === id) {
            req.session.user = {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        }
        
        res.status(200).json({
            success: true,
            message: 'User Updated Successfully',
            user
        });
    }catch(err){
        console.error(err)
        return res.status(500).json({message: 'Something Went Wrong..'});
    }
}

//Delete User
exports.Delete = async (req, res) => {
    const {id} = req.params;
    
    try{
        const user = await Users.findByIdAndDelete(id);

        if(!user){
            return res.status(400).json({message: 'Invalid User Id'});
        }
        
        // Destroy session if user deletes their own account
        if(req.session && req.session.user && req.session.user._id.toString() === id) {
            req.session.destroy();
        }
        
        res.status(200).json({
            success: true,
            message: 'User Deleted Successfully',
            user
        });
    }catch(err){
        console.error(err)
        res.status(500).json({message: 'Something Went Wrong...'});
    }
}

exports.Logout = async(req, res) =>{
    req.session.destroy((err) =>{
        if(err){
            return res.status(500).json({message: 'Logout Failed'});
        }

        res.clearCookie("sessionID");
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    });
};

exports.checkSession = async(req, res) =>{
    console.log("Session ID:", req.sessionID);
    console.log("Session Data:", req.session);
    
    if(req.session && req.session.user){
        console.log("✅ User logged in:", req.session.user);
        
        // Fetch fresh user data from database to get latest timestamps
        try {
            const user = await Users.findById(req.session.user._id).select('-password');
            if(user) {
                // Update session with fresh data
                req.session.user = {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
                
                res.json({
                    success: true,
                    loggedIn: true, 
                    user: req.session.user
                });
            } else {
                res.json({
                    success: false,
                    loggedIn: false
                });
            }
        } catch(err) {
            console.error("Error fetching user:", err);
            res.json({
                success: true,
                loggedIn: true, 
                user: req.session.user
            });
        }
    }else{
        console.log("❌ User not logged in");
        res.json({
            success: false,
            loggedIn: false
        });
    }
};

// Get all users (without passwords)
exports.getBackendData = async (req, res) => {
    try {
        const users = await Users.find().select('-password'); // exclude passwords
        res.status(200).json({ message: 'Users fetched successfully', users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


// Change Password
exports.changePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Find user with password field
        const user = await Users.findById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};
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
        return res.status(201).json({message: 'User Registered Successfully',user});
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server Error....'});
    }
};

//Login
exports.login = async(req, res) =>{
    const {email, password} = req.body;

    try{
        const user = await Users.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({message: 'Invalid Email or Password'});
        }

        req.session.userId = user._id;
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        return res.json({ message: 'Login Successfull'});
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
        res.status(200).json({ message: "User fetched successfully", user });
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

        const user = await Users.findByIdAndUpdate(id,updatedData, {new: true}).select("-password");
        if(!user){
            return res.status(400).json({message: 'Invalid User Id'});
        }
        res.status(200).json({message: 'User Updated Successfully',user});
    }catch(err){
        console.error(err)
        return res.send(500).json({message: 'Something Went Wrong..'});
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
        res.status(200).json({message: 'User Deleted Successfully',user});
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
        res.json({message: "Logged successfully"});
    });
};

exports.checkSession = async(req, res) =>{
    console.log("Session ID:", req.sessionID);
    console.log("Session Data:", req.session);
    if(req.session && req.session.user){
         console.log("✅ User logged in:", req.session.user)
        res.json({loggedIn: true, user: req.session.user});
    }else{
         console.log("✅ User not logged in")
        res.json({loggedIn: false});
    }
};

// module.exports = router;.
const { validationResult } = require('express-validator');

const User = require('../models/user');
const Task = require('../models/task');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;   
    try {
        const totalItems = await User.find().countDocuments();
        const users = await User.find()            
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
                    
        res.status(200).json({
            message: 'Fetched users successfully.', 
            users: users,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }    
};

exports.getUser = async (req, res, next) => {
    const userId = req.params.userId;    
    try {
        const user = await User.findById(userId);        
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message: 'User fetched.', user: user});
    } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
    }
};


exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const role = req.body.role;   

    try {
        const user = await User.findById(userId);       
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
                  
        const hashedPassword = await bcrypt.hash(password, 12);   
        user.email = email;
        user.name = name;
        user.password = hashedPassword;
        user.role = role;
        const result = await user.save();                
        res.status(200).json({message: 'User updated!', user: result});
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const user = await User.findById(userId);        
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        
        if (user.role.toString() === "admin" && user._id.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
            
        await Task.deleteMany({creator: user._id});
        await User.findByIdAndDelete(userId);                        
        res.status(200).json({message: 'Deleted user.'});  
    } catch (err) {        
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
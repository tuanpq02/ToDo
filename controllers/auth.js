const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const role = req.body.role;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);         
        const user = new User({
            email: email,
            password: hashedPassword,
            name: name, 
            role: role
        });
        await user.save();
        res.status(201).json({message: 'User created!', userId: user._id}); 
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {    
    const email = req.body.email;
    const password = req.body.password;    
    try {
        const user = await User.findOne({email: email});        
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }            
        const isEqual = await bcrypt.compare(password, user.password);                
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: user.email, 
                userId: user._id.toString(),
                userRole: user.role,
            }, 'somesupersecretsecret', 
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: user._id.toString() })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
const { validationResult } = require('express-validator');

const Task = require('../models/task');
const User = require('../models/user');

exports.getTasks = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;   
    try {
        const totalItems = await Task.find().countDocuments();
        const tasks = await Task.find()
            .populate('creator')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
                    
        res.status(200).json({
            message: 'Fetched tasks successfully.', 
            tasks: tasks,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }    
};

exports.createTask = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    
    const name = req.body.name;
    const completed = req.body.completed | false;   
    const task = new Task({
        name: name, 
        completed: completed,        
        creator: req.userId,
    });
    try {        
        await task.save();
        const user = await User.findById(req.userId);              
        user.tasks.push(task);
        await user.save();            
        
        res.status(201).json({
            message: 'Task created successfully!',
            task: task,
            creator: { _id: user._id, name: user.name}
        });
    } catch(err) { 
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getTask = async (req, res, next) => {
    const taskId = req.params.taskId;    
    try {
        const task = await Task.findById(taskId);        
        if (!task) {
            const error = new Error('Could not find task.');
            error.statusCode = 404;
            throw error;
        }
        if (task.creator.toString() !== req.userId.toString() && req.userRole.toString() !== "admin") {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }   
        res.status(200).json({message: 'Task fetched.', task: task});
    } catch(err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
    }
};

exports.updateTask = async (req, res, next) => {
    const taskId = req.params.taskId;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    
    const name = req.body.name;
    const completed = req.body.completed | false;      

    try {
        const task = await Task.findById(taskId);       
        if (!task) {
            const error = new Error('Could not find task.');
            error.statusCode = 404;
            throw error;
        }
        
        if (task.creator.toString() !== req.userId.toString() && req.userRole.toString() !== "admin") {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }        
        task.name = name;
        task.completed = completed;
        await task.save();                
        res.status(200).json({message: 'Task updated!', task: task});
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deleteTask = async (req, res, next) => {
    const taskId = req.params.taskId;
    try {
        const task = await Task.findById(taskId);        
        if (!task) {
            const error = new Error('Could not find task.');
            error.statusCode = 404;
            throw error;
        }
        
        if (task.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.statusCode = 403;
            throw error;
        }
            
        await Task.findByIdAndDelete(taskId);                
        const user = await User.findById(req.userId);
        user.tasks.pull(taskId);
        await user.save();
        res.status(200).json({message: 'Deleted task.'});  
    } catch (err) {        
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


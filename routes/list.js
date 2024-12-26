const express = require('express');
const { body } = require('express-validator');

const listController = require('../controllers/list');
const isAuth = require('../middlewares/is-auth');
const authorizeRoles = require('../middlewares/role-base');

const router = express.Router();

router.get('/tasks', isAuth,  authorizeRoles("admin", "user"), listController.getTasks);

router.post('/task', 
    isAuth, 
    authorizeRoles("admin", "user"),
    [
        body('name').trim().isLength({min: 5}),       
    ], 
    listController.createTask
);

router.get('/task/:taskId', isAuth,  authorizeRoles("admin", "user"), listController.getTask);

router.put('/task/:taskId', 
    isAuth, 
    authorizeRoles("admin", "user"),
    [
        body('name').trim().isLength({min: 5}), 
    ], 
    listController.updateTask
);

router.delete('/task/:taskId', isAuth, authorizeRoles("admin", "user"), listController.deleteTask)

module.exports = router;
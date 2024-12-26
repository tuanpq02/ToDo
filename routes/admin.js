const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middlewares/is-auth');
const authorizeRoles = require('../middlewares/role-base');

const router = express.Router();

router.get('/users', isAuth, authorizeRoles("admin"),  adminController.getUsers);

router.get('/user/:userId', isAuth, authorizeRoles("admin"), adminController.getUser);

router.put('/user/:userId', isAuth, authorizeRoles("admin"), adminController.updateUser);

router.delete('/user/:userId', isAuth, authorizeRoles("admin"), adminController.deleteUser);

module.exports = router;
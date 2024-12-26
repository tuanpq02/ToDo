const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const listRoutes = require('./routes/list');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/list', listRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data});
});

const MONGDB_URL = "mongodb+srv://tuanpq02:5l4cbrFDgje4Qfc6@cluster0.unqdz.mongodb.net/todo?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGDB_URL)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));
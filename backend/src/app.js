const express = require('express');


const healthRoutes = require(`./routes/healthRoutes`);

const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./middlewares/globalErrorHandler");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const catageryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/health", healthRoutes);

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/catagories", catageryRoutes)

app.use(globalErrorHandler);


module.exports = app;
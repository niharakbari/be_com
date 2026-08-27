const express = require('express');


const healthRoutes = require(`./routes/healthRoutes`);

const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./middlewares/globalErrorHandler");


const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/health", healthRoutes);

app.use(globalErrorHandler);


module.exports = app;
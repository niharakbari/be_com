const express = require('express');
const cors = require('cors');

const healthRoutes = require(`./routes/healthRoutes`);

const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./middlewares/globalErrorHandler");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const catageryRoutes = require('./routes/categoryRoutes');
const paymentModeRoutes = require("./routes/paymentModeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");

const app = express();

app.use(cors({
    origin: ['http://localhost:5174'],
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/health", healthRoutes);

app.use("/auth", authRoutes);

app.use("/users", userRoutes);

app.use("/catagories", catageryRoutes);

app.use("/api/payment-modes", paymentModeRoutes);

app.use("/transactions", transactionRoutes);

app.use("/statistics", statisticsRoutes);

app.use(globalErrorHandler);


module.exports = app;
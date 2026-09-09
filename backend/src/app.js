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
const budgetRoutes = require("./routes/budgetRoutes");
const notificationRoutes =require("./routes/notificationRoutes");
const recurringTransactionRoutes = require("./routes/recurringTransactionRoutes");
const monthlySavingRoutes = require("./routes/monthlySavingRoutes");
const userSettingsRoutes = require("./routes/userSettingsRoutes");
const yearlyBudgetRoutes = require("./routes/yearlyBudgetRoutes");

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

app.use("/budgets", budgetRoutes);

app.use("/notifications", notificationRoutes );

app.use("/recurring-transactions", recurringTransactionRoutes );

app.use("/monthly-savings", monthlySavingRoutes );

app.use("/user-settings", userSettingsRoutes);

app.use("/yearly-budgets", yearlyBudgetRoutes);

app.use(globalErrorHandler);


module.exports = app;
const cron = require("node-cron");

const recurringTransactionService = require('../services/recurringTransactionService');

const startRecurringTransactionJob = () => {

    cron.schedule(
        "0 0 0 * * *",

        async () => {

            console.log(
                "Running recurring transaction job..."
            );

            try {

                await recurringTransactionService
                    .generateRecurringTransactions();

                console.log(
                    "Recurring transaction job completed"
                );

            } catch (error) {

                console.error(
                    "Recurring transaction job failed:",
                    error
                );
            }
        },

        {
            timezone:
                process.env.APP_TIMEZONE ||
                "Asia/Kolkata"
        }
    );

    console.log(
        "Recurring transaction scheduler started"
    );
};


module.exports = startRecurringTransactionJob;
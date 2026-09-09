const cron = require("node-cron");

const monthlySavingService =
    require("../services/monthlySavingService");


const startMonthlySavingJob = () => {

    cron.schedule(
        "0 0 0 1 * *",

        async () => {

            console.log(
                "Running monthly saving job..."
            );

            try {

                await monthlySavingService
                    .generateMonthlySavings();

                console.log(
                    "Monthly saving job completed"
                );

            } catch (error) {

                console.error(
                    "Monthly saving job failed:",
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
        "Monthly saving scheduler started"
    );
};


module.exports = startMonthlySavingJob;
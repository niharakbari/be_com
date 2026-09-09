const http = require(`http`);

const app = require('./app');

const db = require('./config/database');

const config = require('./config/config');
const logger = require('./config/logger');

const startRecurringTransactionJob = require("./jobs/recurringTransactionJob");
startRecurringTransactionJob();

const startMonthlySavingJob = require("./jobs/monthlySavingJob");

startMonthlySavingJob();

app.listen( config.port, (err) => {
    
    if(err) {
        logger.console.error("Error Starting the server");
    };

    logger.info("Server connected successfully on port " + config.port);

});
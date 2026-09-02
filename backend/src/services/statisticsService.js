const statisticsModel = require(
    "../models/statisticsModel"
);


const getStatistics = async (
    userId,
    filters
) => {

    const statistics =
        await statisticsModel.getStatistics(
            userId,
            filters
        );


    const totalIncome =
        Number(statistics.total_income);

    const totalExpense =
        Number(statistics.total_expense);


    const netBalance =
        totalIncome - totalExpense;


    return {
        totalIncome,
        totalExpense,
        netBalance
    };
};


module.exports = {
    getStatistics
};
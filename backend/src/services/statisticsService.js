const AppError = require("../utils/AppError");
const statisticsModel = require(
    "../models/statisticsModel"
);


const isValidDate = (dateString) => {

    if (!dateString) {
        return true;
    }

    const dateRegex =
        /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(dateString)) {
        return false;
    }

    const date = new Date(
        `${dateString}T00:00:00Z`
    );

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === dateString
    );

};


const validateDateFilters = (
    startDate,
    endDate
) => {

    if (!isValidDate(startDate)) {

        throw new AppError("Invalid startDate. Use YYYY-MM-DD.", 400);

    }


    if (!isValidDate(endDate)) {

        throw new AppError("Invalid endDate. Use YYYY-MM-DD.", 400);

    }


    if (
        startDate &&
        endDate &&
        startDate > endDate
    ) {

        throw new AppError("startDate cannot be later than endDate.", 400);

    }

};


const validatePositiveInteger = (
    value,
    fieldName
) => {

    if (value === undefined) {
        return;
    }

    const numberValue =
        Number(value);


    if (
        !Number.isInteger(numberValue) ||
        numberValue <= 0
    ) {

        throw new AppError(`Invalid ${fieldName}. Must be a positive integer.`, 400);

    }

};


const validateBreakdownFilters = (
    filters
) => {

    const {
        groupBy,
        type,
        categoryId,
        paymentModeId,
        sortBy,
        order
    } = filters;


    const allowedGroupBy = [
        "category",
        "paymentMode",
        "date"
    ];


    if (
        !allowedGroupBy.includes(groupBy)
    ) {

        throw new AppError("Invalid groupBy. Use category, paymentMode, or date.", 400);

    }


    if (
        type &&
        !["income", "expense"].includes(type)
    ) {

        throw new AppError("Invalid type. Use income or expense.", 400);

    }


    if (
        sortBy &&
        !["amount", "date"].includes(sortBy)
    ) {

        throw new AppError("Invalid sortBy. Use amount or date.", 400);

    }


    if (
        order &&
        !["ASC", "DESC"].includes(
            order.toUpperCase()
        )
    ) {

        throw new AppError("Invalid order. Use ASC or DESC.", 400);

    }


    validatePositiveInteger(
        categoryId,
        "categoryId"
    );


    validatePositiveInteger(
        paymentModeId,
        "paymentModeId"
    );

};


const getStatistics = async (
    userId,
    filters = {}
) => {

    const {
        startDate,
        endDate
    } = filters;


    validateDateFilters(
        startDate,
        endDate
    );


    const statistics =
        await statisticsModel.getStatistics(
            userId,
            {
                startDate,
                endDate
            }
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


const getBreakdownStatistics = async (
    userId,
    filters = {}
) => {

    const {
        startDate,
        endDate
    } = filters;


    validateDateFilters(
        startDate,
        endDate
    );


    validateBreakdownFilters(
        filters
    );


    const statistics =
        await statisticsModel
            .getBreakdownStatistics(
                userId,
                filters
            );


    return statistics;

};


module.exports = {
    getStatistics,
    getBreakdownStatistics
};
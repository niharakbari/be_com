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

        const error = new Error(
            "Invalid startDate. Use YYYY-MM-DD."
        );

        error.statusCode = 400;

        throw error;

    }


    if (!isValidDate(endDate)) {

        const error = new Error(
            "Invalid endDate. Use YYYY-MM-DD."
        );

        error.statusCode = 400;

        throw error;

    }


    if (
        startDate &&
        endDate &&
        startDate > endDate
    ) {

        const error = new Error(
            "startDate cannot be later than endDate."
        );

        error.statusCode = 400;

        throw error;

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

        const error = new Error(
            `Invalid ${fieldName}. Must be a positive integer.`
        );

        error.statusCode = 400;

        throw error;

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

        const error = new Error(
            "Invalid groupBy. Use category, paymentMode, or date."
        );

        error.statusCode = 400;

        throw error;

    }


    if (
        type &&
        !["income", "expense"].includes(type)
    ) {

        const error = new Error(
            "Invalid type. Use income or expense."
        );

        error.statusCode = 400;

        throw error;

    }


    if (
        sortBy &&
        !["amount", "date"].includes(sortBy)
    ) {

        const error = new Error(
            "Invalid sortBy. Use amount or date."
        );

        error.statusCode = 400;

        throw error;

    }


    if (
        order &&
        !["ASC", "DESC"].includes(
            order.toUpperCase()
        )
    ) {

        const error = new Error(
            "Invalid order. Use ASC or DESC."
        );

        error.statusCode = 400;

        throw error;

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
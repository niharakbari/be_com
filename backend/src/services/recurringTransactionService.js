const db = require("../config/database");

const recurringModel =
    require("../models/recurringTransactionModel");

const transactionModel =
    require("../models/transactionModel");

const categoryModel =
    require("../models/categoryModel");

const paymentModeModel =
    require("../models/paymentModeModel");

const notificationService =
    require("./notificationService");

const AppError =
    require("../utils/AppError");




const validateRecurringData = async (
    userId,
    data
) => {

    if (
        !Number.isFinite(Number(data.amount)) ||
        Number(data.amount) <= 0
    ) {
        throw new AppError(
            "Amount must be greater than 0",
            400
        );
    }


    const frequencies = [
        "daily",
        "weekly",
        "monthly",
        "yearly"
    ];

    if (!frequencies.includes(data.frequency)) {
        throw new AppError(
            "Invalid recurring frequency",
            400
        );
    }


    const category =
        await categoryModel.findCategoryByIdAndUser(
            data.category_id,
            userId
        );

    if (!category) {
        throw new AppError(
            "Category not found",
            404
        );
    }

    if (category.type !== "expense") {
        throw new AppError(
            "Recurring transactions must use an expense category",
            400
        );
    }


    const paymentMode =
        await paymentModeModel.findPaymentModeById(
            data.payment_mode_id
        );

    if (!paymentMode) {
        throw new AppError(
            "Payment mode not found",
            404
        );
    }


    if (!data.start_date) {
        throw new AppError(
            "Start date is required",
            400
        );
    }


    if (!data.next_occurrence_date) {
        throw new AppError(
            "Next occurrence date is required",
            400
        );
    }


    if (
        data.is_active !== undefined &&
        data.is_active !== 0 &&
        data.is_active !== 1 &&
        data.is_active !== true &&
        data.is_active !== false
    ) {
        throw new AppError(
            "is_active must be boolean",
            400
        );
    }
};



const createRecurringTransaction = async (
    userId,
    data
) => {

    const preparedData = {
        ...data,

        
        next_occurrence_date:
            data.next_occurrence_date ||
            data.start_date,

        is_active:
            data.is_active === undefined
                ? 1
                : data.is_active ? 1 : 0
    };


    await validateRecurringData(
        userId,
        preparedData
    );


    const id =
        await recurringModel.createRecurringTransaction(
            userId,
            preparedData
        );


    return await recurringModel.findRecurringTransactionById(
        id,
        userId
    );
};


const getRecurringTransactions = async (
    userId
) => {

    return await recurringModel.getRecurringTransactions(
        userId
    );
};



const getRecurringTransactionById = async (
    id,
    userId
) => {

    const recurring =
        await recurringModel.findRecurringTransactionById(
            id,
            userId
        );

    if (!recurring) {
        throw new AppError(
            "Recurring transaction not found",
            404
        );
    }

    return recurring;
};



const updateRecurringTransaction = async (
    id,
    userId,
    data
) => {

    const existing =
        await getRecurringTransactionById(
            id,
            userId
        );


    const updated = {
        ...existing,
        ...data
    };


    await validateRecurringData(
        userId,
        updated 
    );


    await recurringModel.updateRecurringTransaction(
        id,
        userId,
        updated
    );


    return await getRecurringTransactionById(
        id,
        userId
    );
};



const deleteRecurringTransaction = async (
    id,
    userId
) => {

    const affectedRows =
        await recurringModel.deleteRecurringTransaction(
            id,
            userId
        );

    if (affectedRows === 0) {
        throw new AppError(
            "Recurring transaction not found",
            404
        );
    }

    return true;
};


const activateRecurringTransaction = async (
    userId,
    id
) => {

    await getRecurringTransactionById(
        id,
        userId
    );


    await recurringModel.setRecurringTransactionStatus(
        id,
        userId,
        1
    );


    return await getRecurringTransactionById(
        id,
        userId
    );
};


const deactivateRecurringTransaction = async (
    userId,
    id
) => {

    await getRecurringTransactionById(
        id,
        userId
    );


    await recurringModel.setRecurringTransactionStatus(
        id,
        userId,
        0
    );


    return await getRecurringTransactionById(
        id,
        userId
    );
};


const calculateNextOccurrence = (
    currentDate,
    frequency
) => {

    const date =
        new Date(`${currentDate}T00:00:00Z`);


    switch (frequency) {

        case "daily":

            date.setUTCDate(
                date.getUTCDate() + 1
            );

            break;


        case "weekly":

            date.setUTCDate(
                date.getUTCDate() + 7
            );

            break;


        case "monthly": {

            
            const originalDay =
                date.getUTCDate();

            const targetMonth =
                date.getUTCMonth() + 1;

            date.setUTCDate(1);

            date.setUTCMonth(targetMonth);

            const lastDay =
                new Date(
                    Date.UTC(
                        date.getUTCFullYear(),
                        date.getUTCMonth() + 1,
                        0
                    )
                ).getUTCDate();

            date.setUTCDate(
                Math.min(originalDay, lastDay)
            );

            break;
        }


        case "yearly":

            date.setUTCFullYear(
                date.getUTCFullYear() + 1
            );

            break;


        default:

            throw new AppError(
                "Invalid recurring frequency",
                400
            );
    }


    return date
        .toISOString()
        .split("T")[0];
};


const generateRecurringTransactions = async () => {

    const connection =
        await db.getConnection();


    try {

        const dueRecurringTransactions =
            await recurringModel.getDueRecurringTransactions(
                connection
            );


        for (
            const recurring
            of dueRecurringTransactions
        ) {

            await connection.beginTransaction();


            try {

                let nextOccurrence =
                    recurring.next_occurrence_date;


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];

                while (
                    nextOccurrence <= today
                ) {

                    const existingOccurrence =
                        await recurringModel.findOccurrence(
                            recurring.id,
                            nextOccurrence,
                            connection
                        );


                    if (!existingOccurrence) {

                        const transactionId =
                            await transactionModel.createTransaction(
                                recurring.user_id,
                                recurring.category_id,
                                recurring.payment_mode_id,
                                recurring.amount,
                                nextOccurrence,
                                recurring.note,
                                connection
                            );


                        await recurringModel.createOccurrence(
                            recurring.id,
                            transactionId,
                            nextOccurrence,
                            connection
                        );
                    }


                   
                    nextOccurrence =
                        calculateNextOccurrence(
                            nextOccurrence,
                            recurring.frequency
                        );
                }


              
                await recurringModel.updateNextOccurrenceDate(
                    recurring.id,
                    nextOccurrence,
                    connection
                );


                await connection.commit();

                await notificationService
                    .generateBudgetNotifications(
                        recurring.user_id
                    );


            } catch (error) {

                await connection.rollback();

                console.error(
                    `Failed recurring transaction ${recurring.id}:`,
                    error
                );
            }
        }

    } finally {

        connection.release();
    }
};


module.exports = {
    createRecurringTransaction,
    getRecurringTransactions,
    getRecurringTransactionById,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    activateRecurringTransaction,
    deactivateRecurringTransaction,
    calculateNextOccurrence,
    generateRecurringTransactions
};
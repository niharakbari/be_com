const monthlySavingService =
    require("../services/monthlySavingService");


const createSavingsGoal = async (req, res) => {

    const userId = req.user.id;

    const {
        savingMonth,
        savingYear,
        savingsGoal
    } = req.body;

    const id =
        await monthlySavingService.createSavingsGoal(
            userId,
            savingMonth,
            savingYear,
            savingsGoal
        );

    res.status(201).json({
        success: true,
        message: "Savings goal created successfully",
        data: {
            id
        }
    });
};


const getSavings = async (req, res) => {

    const userId = req.user.id;

    const month =
        req.query.month
            ? Number(req.query.month)
            : null;

    const year =
        req.query.year
            ? Number(req.query.year)
            : null;

    const savings =
        await monthlySavingService.getSavings(
            userId,
            month,
            year
        );

    res.status(200).json({
        success: true,
        data: savings
    });
};


const updateSavingsGoal = async (req, res) => {

    const userId = req.user.id;

    const { id } = req.params;

    const {
        savingsGoal
    } = req.body;

    await monthlySavingService.updateSavingsGoal(
        userId,
        id,
        savingsGoal
    );

    res.status(200).json({
        success: true,
        message: "Savings goal updated successfully"
    });
};


const deleteSavingsGoal = async (req, res) => {

    const userId = req.user.id;

    const { id } = req.params;

    await monthlySavingService.deleteSavingsGoal(
        userId,
        id
    );

    res.status(200).json({
        success: true,
        message: "Savings goal deleted successfully"
    });
};


module.exports = {
    createSavingsGoal,
    getSavings,
    updateSavingsGoal,
    deleteSavingsGoal
};
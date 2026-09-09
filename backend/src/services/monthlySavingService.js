const monthlySavingModel = require("../models/monthlySavingModel");
const db = require("../config/database");

const monthlySavingService = {

    createSavingsGoal: async (
        userId,
        savingMonth,
        savingYear,
        savingsGoal
    ) => {

        const existing =
            await monthlySavingModel.findByUserAndMonth(
                userId,
                savingMonth,
                savingYear
            );

        if (existing) {
            throw new Error(
                "Savings goal already exists for this month"
            );
        }

        return await monthlySavingModel.create(
            userId,
            savingMonth,
            savingYear,
            savingsGoal
        );
    },


    getSavings: async (
        userId,
        month,
        year
    ) => {

        return await monthlySavingModel.getByUser(
            userId,
            month,
            year
        );
    },


    updateSavingsGoal: async (
        userId,
        id,
        savingsGoal
    ) => {

        const saving = await db.query(
            `
            SELECT id
            FROM monthly_savings
            WHERE id = ?
              AND user_id = ?
            LIMIT 1
            `,
            [id, userId]
        );

        if (!saving[0].length) {
            throw new Error("Savings record not found");
        }

        const affectedRows =
            await monthlySavingModel.updateGoal(
                id,
                userId,
                savingsGoal
            );

        if (!affectedRows) {
            throw new Error("Failed to update savings goal");
        }

        return true;
    },


    deleteSavingsGoal: async (
        userId,
        id
    ) => {

        const affectedRows =
            await monthlySavingModel.delete(
                id,
                userId
            );

        if (!affectedRows) {
            throw new Error("Savings record not found");
        }

        return true;
    },


    calculateActualSaving: async (
        userId,
        month,
        year
    ) => {



        const [overallBudget] = await db.query(
            `
            SELECT
                id,
                amount
            FROM budgets
            WHERE user_id = ?
              AND category_id IS NULL
              AND budget_month = ?
              AND budget_year = ?
            LIMIT 1
            `,
            [
                userId,
                month,
                year
            ]
        );



        if (overallBudget.length > 0) {

            const [expenseResult] = await db.query(
                `
                SELECT
                    COALESCE(SUM(t.amount), 0) AS total_expense
                FROM transactions t
                INNER JOIN categories c
                    ON c.id = t.category_id
                WHERE t.user_id = ?
                  AND c.type = 'expense'
                  AND t.transaction_date >= ?
                  AND t.transaction_date < ?
                `,
                [
                    userId,
                    `${year}-${String(month).padStart(2, "0")}-01`,
                    this.getNextMonthDate(year, month)
                ]
            );

            const budgetAmount =
                Number(overallBudget[0].amount);

            const totalExpense =
                Number(expenseResult[0].total_expense);

            return Math.max(
                0,
                budgetAmount - totalExpense
            );
        }



        const [categoryBudgets] = await db.query(
            `
            SELECT
                b.id,
                b.category_id,
                b.amount
            FROM budgets b
            INNER JOIN categories c
                ON c.id = b.category_id
            WHERE b.user_id = ?
              AND b.category_id IS NOT NULL
              AND b.budget_month = ?
              AND b.budget_year = ?
              AND c.type = 'expense'
            `,
            [
                userId,
                month,
                year
            ]
        );

        let actualSaving = 0;

        for (const budget of categoryBudgets) {

            const [spentResult] = await db.query(
                `
                SELECT
                    COALESCE(SUM(t.amount), 0) AS spent
                FROM transactions t
                INNER JOIN categories c
                    ON c.id = t.category_id
                WHERE t.user_id = ?
                  AND t.category_id = ?
                  AND c.type = 'expense'
                  AND t.transaction_date >= ?
                  AND t.transaction_date < ?
                `,
                [
                    userId,
                    budget.category_id,
                    `${year}-${String(month).padStart(2, "0")}-01`,
                    this.getNextMonthDate(year, month)
                ]
            );

            const budgetAmount =
                Number(budget.amount);

            const spent =
                Number(spentResult[0].spent);

            const remaining =
                Math.max(
                    0,
                    budgetAmount - spent
                );

            actualSaving += remaining;
        }

        return actualSaving;
    },


    getNextMonthDate: (
        year,
        month
    ) => {

        const date = new Date(
            Number(year),
            Number(month),
            1
        );

        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-01`;
    },


    generateMonthlySavings: async () => {

       

        const pendingSavings =
            await monthlySavingModel.getPendingMonths();

        const currentDate = new Date();

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        for (const saving of pendingSavings) {

            const isCurrentOrFuture =
                saving.saving_year > currentYear ||
                (
                    saving.saving_year === currentYear &&
                    saving.saving_month >= currentMonth
                );

            if (isCurrentOrFuture) {
                continue;
            }

            const actualSaving =
                await monthlySavingService.calculateActualSaving(
                    saving.user_id,
                    saving.saving_month,
                    saving.saving_year
                );

            await monthlySavingModel.updateActualSaving(
                saving.id,
                actualSaving
            );

            console.log(
                `Monthly saving calculated: user=${saving.user_id}, ` +
                `month=${saving.saving_month}/${saving.saving_year}, ` +
                `actual=${actualSaving}`
            );
        }

        return true;
    }

};

module.exports = monthlySavingService;
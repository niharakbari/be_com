const db = require("../config/database");

const monthlySavingModel = {

    create: async (
        userId,
        savingMonth,
        savingYear,
        savingsGoal
    ) => {

        const [result] = await db.query(
            `
            INSERT INTO monthly_savings
            (
                user_id,
                saving_month,
                saving_year,
                savings_goal
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                userId,
                savingMonth,
                savingYear,
                savingsGoal
            ]
        );

        return result.insertId;
    },


    findByUserAndMonth: async (
        userId,
        savingMonth,
        savingYear
    ) => {

        const [rows] = await db.query(
            `
            SELECT
                id,
                user_id,
                saving_month,
                saving_year,
                savings_goal,
                actual_saving,
                created_at,
                updated_at
            FROM monthly_savings
            WHERE user_id = ?
              AND saving_month = ?
              AND saving_year = ?
            LIMIT 1
            `,
            [
                userId,
                savingMonth,
                savingYear
            ]
        );

        return rows[0] || null;
    },


    getByUser: async (
        userId,
        month,
        year
    ) => {

        let sql = `
            SELECT
                id,
                user_id,
                saving_month,
                saving_year,
                savings_goal,
                actual_saving,
                created_at,
                updated_at
            FROM monthly_savings
            WHERE user_id = ?
        `;

        const params = [userId];

        if (month) {
            sql += ` AND saving_month = ?`;
            params.push(month);
        }

        if (year) {
            sql += ` AND saving_year = ?`;
            params.push(year);
        }

        sql += `
            ORDER BY saving_year DESC, saving_month DESC
        `;

        const [rows] = await db.query(sql, params);

        return rows;
    },


    updateGoal: async (
        id,
        userId,
        savingsGoal
    ) => {

        const [result] = await db.query(
            `
            UPDATE monthly_savings
            SET savings_goal = ?
            WHERE id = ?
              AND user_id = ?
            `,
            [
                savingsGoal,
                id,
                userId
            ]
        );

        return result.affectedRows;
    },


    delete: async (
        id,
        userId
    ) => {

        const [result] = await db.query(
            `
            DELETE FROM monthly_savings
            WHERE id = ?
              AND user_id = ?
            `,
            [
                id,
                userId
            ]
        );

        return result.affectedRows;
    },


    updateActualSaving: async (
        id,
        actualSaving
    ) => {

        const [result] = await db.query(
            `
            UPDATE monthly_savings
            SET actual_saving = ?
            WHERE id = ?
            `,
            [
                actualSaving,
                id
            ]
        );

        return result.affectedRows;
    },


    getPendingMonths: async () => {

        const [rows] = await db.query(
            `
            SELECT
                id,
                user_id,
                saving_month,
                saving_year,
                savings_goal
            FROM monthly_savings
            WHERE actual_saving IS NULL
            `
        );

        return rows;
    }

};

module.exports = monthlySavingModel;
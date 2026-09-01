const isValidMoney = (amount) => {
    if (amount === undefined || amount === null) {
        return false;
    }

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return false;
    }

    if (value <= 0) {
        return false;
    }

    if (value > 999999999999.99) {
        return false;
    }

    return true;
};


module.exports = {
    isValidMoney
};
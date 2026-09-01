const isValidDate = (date) => {

    if (!date) {
        return false;
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return false;
    }

    return true;
};


module.exports = {
    isValidDate
};
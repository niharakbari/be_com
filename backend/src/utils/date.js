const localDateTimeRegex =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

const isValidLocalDateTime = (value) => {
    if (typeof value !== "string") {
        return false;
    }

    const match = value.match(localDateTimeRegex);

    if (!match) {
        return false;
    }

    const [, year, month, day, hour, minute] = match.map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    return (
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= daysInMonth &&
        hour >= 0 &&
        hour <= 23 &&
        minute >= 0 &&
        minute <= 59
    );
};

const normalizeLocalDateTime = (value) => {
    if (!isValidLocalDateTime(value)) {
        return null;
    }

    return `${value.replace("T", " ")}:00`;
};


module.exports = {
    isValidLocalDateTime,
    normalizeLocalDateTime
};
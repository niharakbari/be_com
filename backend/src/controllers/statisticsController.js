const statisticsService = require(
    "../services/statisticsService"
);


const getStatistics = async (
    req,
    res,
    next
) => {

    try {

        const userId =
            req.user.id;


        const {
            startDate,
            endDate
        } = req.query;


        const statistics =
            await statisticsService.getStatistics(
                userId,
                {
                    startDate,
                    endDate
                }
            );


        return res.status(200).json({
            success: true,
            data: statistics
        });

    } catch (error) {

        next(error);

    }

};


module.exports = {
    getStatistics
};
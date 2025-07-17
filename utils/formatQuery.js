const formatQuery = (req, res, next) => {
    const queryObj = { ...req.query };
    const deleteFields = ["page", "limit", "sort", "fields"];
    deleteFields.forEach(field => delete queryObj[field]);

    // price[lt]=400 gibi gelenleri { price: { $lt: 400 } }'e çevir
    const formattedParams = {};
    Object.keys(queryObj).forEach(key => {
        const match = key.match(/^(\w+)\[(gte|gt|lte|lt)\]$/);
        if (match) {
            const field = match[1];
            const operator = `$${match[2]}`;
            if (!formattedParams[field]) formattedParams[field] = {};
            formattedParams[field][operator] = Number(queryObj[key]);
        } else {
            formattedParams[key] = queryObj[key];
        }
    });
    req.formattedParams = formattedParams;
    next();
}
export default formatQuery;
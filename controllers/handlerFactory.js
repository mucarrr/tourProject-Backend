import APIFeatures from "../utils/apiFeatures.js";

export const getAll = async (Model, req, res) => { //burdaki model mongoose icinden gelen schema'yi alir
    try{
        let filters = {};
        if(req.params.tourID) filters = {
            tour: req.params.tourID
        }
        const features = new APIFeatures(Model.find(filters), req.query, req.formattedParams)
        .filter()
        .sort()
        .limit()
        .paginate();

        const documents = await features.query;

        return res.status(200).json({
            success: true,
            message: `${Model.modelName} fetched successfully`,
            count: documents.length,
            data: documents
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
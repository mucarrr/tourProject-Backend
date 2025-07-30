import APIFeatures from "../utils/apiFeatures.js";

export const getAll = async (Model, req, res) => { //burdaki model mongoose icinden gelen schema'yi alir
    try{
        let filters = {};
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
export const getSingle = async (Model, req, res) => {
    try{
        const document = await Model.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: `${Model.modelName} fetched successfully`,
            data: document
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export const createOne = async (Model, req, res) => {
    try{
        if(Model.modelName === "Review"){
            req.body.user = req.user.id;
        }
        const document = await Model.create(req.body);
        return res.status(201).json({
            success: true,
            message: `${Model.modelName} created successfully`,
            data: document
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
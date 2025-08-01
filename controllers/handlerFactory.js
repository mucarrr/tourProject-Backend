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
export const updateOne = async (Model, req, res) => {
    try{
        const document = await Model.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }
        
        if(Model.modelName === "Review"){
            if(document.user._id.toString() !== req.user.id){
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to update this document"
                });
            } 
        }
        
        const updatedDocument = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        return res.status(200).json({
            success: true,
            message: `${Model.modelName} updated successfully`,
            data: updatedDocument
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
export const deleteOne = async (Model, req, res) => {
    try{
        const document = await Model.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }
        
        if(Model.modelName === "Review"){
            if(document.user._id.toString() !== req.user.id){
                return res.status(403).json({
                    success: false,
                    message: "You are not allowed to delete this document"
                });
            } 
        }
        
        await document.deleteOne();
        return res.status(200).json({
            success: true,
            message: `${Model.modelName} deleted successfully`
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
class APIFeatures{
    constructor(query, params, formattedParams){
        this.query = query;
        this.params = params;
        this.formattedParams = formattedParams;
    }

    filter(){
        console.log('Filtering with:', this.formattedParams);
        this.query = this.query.find(this.formattedParams);
        return this;
    }

    sort(){
        if(this.params.sort){
            this.query.sort(this.params.sort.replaceAll(",", " "));
        }else{
            this.query.sort("-createdAt");
        }
        return this;
    }

    limit(){
        if(this.params.fields){
            const fields = this.params.fields.split(",").join(" ");
            this.query.select(fields);
        }
        return this;
    }

    paginate(){
        const page = Number(this.params.page) || 1;
        const limit = ( this.params.limit <= 30 ? Number(this.params.limit) : this.params.limit ? 30 : 10 );
        const skip = (page - 1) * limit;
        this.query.skip(skip).limit(limit);
        return this;
    }
}
export default APIFeatures;
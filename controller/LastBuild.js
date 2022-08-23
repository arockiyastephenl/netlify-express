const {
    payload
} = require("../Modal/LastInitialQuery")
module.exports = {
    lastQueryBuild: async ({
        brand,
        categories,
        gender,
        platform,
        froms,
        location,
        productUrl,
        cat,
        // name
    }) => {
        let top;
        gender==="women"?top = ["womenOvalBustMin","acrossShoulderMin"]:top = ["menOvalChestMin","acrossShoulderMin"]
        let bottom = ["hipMin","inSeamLengthMin","outSeamLengthMin"]
        
        let Dress;
        gender==="men"?Dress="Suits":Dress="Dresses"
        payload.query.bool.must = [{
            "exists": {
                "field": "measurements"
            }

        }]

        payload.query.bool.filter = [{
            "bool": {
                "must": [],
                "must_not": [],
                "should": []
            }
        }]


        payload.query.bool.should = []
        payload.query.bool.must_not = []
        payload.sort = []


        
        let platformQuery = {
            "bool": {
                "should": []
            }
        }

        if (platform.length > 0) {
            platformQuery.bool.should.push({
                "match_phrase": {
                    "platform": platform,
                }
            })
        }

        let brandsQuery = {
            "bool": {
                "should": []
            }
        }

        if (brand.length > 0) {
            brandsQuery.bool.should.push({
                "match_phrase": {
                    "brand.name": brand,
                }
            })
        }

        let categoriesQuery = {
            "bool": {
                "should": []
            }
        }

        if (categories.length > 0) {
            categoriesQuery.bool.should.push({
                "match_phrase": {
                    "categories": categories,
                }
            })
        }

        let genderQuery = {
            "bool": {
                "should": [
                    
                ]
            }
        };
        if (gender.length > 0) {
            genderQuery.bool.should.push({
                "match_phrase": {
                    "gender": gender,
                }
            })
        }


        let countryQuery = {
            "bool": {
                "must": []
            }
        };

        let Query = {
            "bool": {
                "should": []
            }
        };
       
        // let Name = {
        //     "bool": {
        //         "should": []
        //     }
        // };
        
        
        
        // if (name.length > 0) {
        //     Name.bool.should.push({
        //         "match_phrase": {
        //             "name": name,
        //         }
        //     })
        // }

        location !== "" && location !== null && countryQuery.bool.must.push({
            "match": {
                "location": location
            }
        })


        let DressIndex = {
            "match_phrase": {
                "categories": Dress,
            }
        }
       
        if (productUrl !== "") {
            payload.aggs = {}
            payload.from = 0;
            payload.query.bool.filter[0].bool.must = [];
            payload.query.bool.filter[0].bool.must.push({
                "match_phrase": {
                    "deepLink": productUrl
                }
            })
        } else {
            payload.from = froms;
            payload.query.bool.filter[0].bool.must = [];
            payload.query.bool.filter[0].bool.must = [
                brandsQuery,
                platformQuery,
                categoriesQuery,
                genderQuery,
                countryQuery,
                Query
            ]
            if (platform?.length !== 0) {
                delete payload.aggs["platform"]
                if (brand?.length !== 0) {

                    delete payload.aggs["brand"]
                    if (categories?.length !== 0) {
                        // delete payload.aggs["categories"]
                        payload.aggs = {}
                        // if (name?.length !== 0) {
                        //     delete payload.aggs["name"]
                        // }
                        // else {
                        //     if (payload.aggs["name"] === undefined) payload.aggs["name"] = {
                        //         "terms": {
                        //             "field": "name.keyword",
                        //             "size": 100000,
                        //             "min_doc_count": 1
                        //         }
                        //     }
                        // }
                    }
                    else {
                        
                        if (payload.aggs["categories"] === undefined) payload.aggs["categories"] = {
                            "terms": {
                                "field": "categories.keyword",
                                "size": 100000,
                                "min_doc_count": 1
                            }
                        }
                    }
                } else {
                    delete payload.aggs["categories"]
                    if (payload.aggs["brand"] === undefined) payload.aggs["brand"] = {
                        "terms": {
                            "field": "brand.name.keyword",
                            "size": 100000,
                            "min_doc_count": 1
                        }
                    }
                }
            } else {
                delete payload.aggs["brand"]
                delete payload.aggs["categories"]
                delete payload.aggs["name"]

                if (payload.aggs["platform"] === undefined) payload.aggs["platform"] = {
                    "terms": {
                        "field": "platform.keyword",
                        "size": 100000,
                        "min_doc_count": 1
                    }
                }

            }

        }
        cat==="top"?
        top.forEach((values, i) => {
            Query.bool.should[i] = {
                "exists": {
                    "field": `measurements.IN.*.${values}`,
                }
            }
        }):cat==="bottom"?
        bottom.forEach((values, i) => {
            Query.bool.should[i] = {
                "exists": {
                    "field": `measurements.IN.*.${values}`,
                }
            }
        }):""

        cat==="top"?
        bottom.forEach((values) => {
            payload.query.bool.must_not.push({
                "exists": {
                    "field": `measurements.IN.*.${values}`,
                }
            }
        )}):cat==="bottom"?
        top.forEach((values) => {
            payload.query.bool.must_not.push({
                "exists": {
                    "field": `measurements.IN.*.${values}`,
                }
            }
        )}):""

        
        if ((cat.length > 0) && (cat==="dress")) {
            payload.query.bool.filter[0].bool.must.push(DressIndex)
        }
        return {
            query: payload,

        }
    },
    lastqueryLogic: async (finalResult) => {
        return finalResult
    }
}
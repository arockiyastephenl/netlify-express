// const payload = require('./topDressIntialQuery.js');
const { payload } = require("../Modal/TopintialQuerry");
let jsonDataList = []
module.exports = {
    TopQueryBuild: async ({ gender, froms, location, inseam, outseam, shoulder, hip, bust, chest, topWaist, bottomWaist, sizeCode, measurementsUnit, brandsList, categoriesList }) => {


        let waist = ''

        if ((topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined") && (bottomWaist === '' || bottomWaist === 0 || typeof bottomWaist === "undefined")) {
            waist = topWaist
        } else if ((bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined") && (topWaist === '' || topWaist === 0 || typeof topWaist === "undefined")) {
            waist = bottomWaist
        } else if ((topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined") && (bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined")) {
            waist = topWaist < bottomWaist ? topWaist : bottomWaist
        } else {
            waist = ''
        }

        categoriesList = categoriesList.filter((e) => !brandsList.includes(e))
        // console.log(categoriesList)

        payload.query.bool.must = [{
            "exists": {
                "field": "measurements"
            }
        }]
        payload.query.bool.should = []
        payload.query.bool.must_not = []
        payload.sort = []
        // Checking the input values
        let allSearch = []

        let choosenList = []

        let styleQuery = {
            "bool": {
                "should": []
            }
        }
        let genderQuery = {
            "bool": {
                "should": []
            }
        };

        let countryQuery = {
            "bool": {
                "must": []
            }
        };
        location !== "" && location !== null && countryQuery.bool.must.push({
            "match": {
                "location": location
            }
        })

        if (chest !== "" && chest !== 0 && typeof chest !== "undefined") {
            allSearch.push({
                searchName: 'menOvalChest',
                searchValue: chest
            })
            choosenList.push('menOvalChestMin')
        }
        if (shoulder !== "" && shoulder !== 0 && typeof shoulder !== "undefined") {
            allSearch.push({
                searchName: 'acrossShoulder',
                searchValue: shoulder
            })
            choosenList.push('acrossShoulderMin')
        }
        if (waist !== '' && waist !== 0 && typeof waist !== "undefined") {
            allSearch.push({
                searchName: 'waist',
                searchValue: waist
            })
            choosenList.push('waistMin')
        }
        if (inseam !== "" && inseam !== 0 && typeof inseam !== "undefined") {
            allSearch.push({
                searchName: 'inSeamLength',
                searchValue: inseam
            })
            choosenList.push('inSeamLengthMin')
        }
        if (bust !== "" && bust !== 0 && typeof bust !== "undefined") {
            allSearch.push({
                searchName: 'womenOvalBust',
                searchValue: bust
            })
            choosenList.push('womenOvalBustMin')
        }
        if (hip !== "" && hip !== 0 && typeof hip !== "undefined") {
            allSearch.push({
                searchName: 'hip',
                searchValue: hip
            })
            choosenList.push('hipMin')
        }
        if (outseam !== "" && outseam !== 0 && typeof outseam !== "undefined") {
            allSearch.push({
                searchName: 'outSeamLength',
                searchValue: outseam
            })
            choosenList.push('outSeamLengthMin')
        }

        payload.sort = []

        let AllValuesIndicator;
        // for Dresses
        if ((bust !== '' || chest !== '' || shoulder !== '' || topWaist !== '') && (outseam !== '' || inseam !== '' || hip !== '' || bottomWaist !== '')) {
            AllValuesIndicator = 'Dress'
            for (let fit of allSearch) {
                let subExistsPayload = {
                    "exists": {
                        "field": `measurements.${measurementsUnit}.*.${fit.searchName}Min`
                    }
                }
                payload.query.bool.should.push(subExistsPayload)
                let tempList = []
                for (let size of sizeCode) {
                    let subSizePayload = {
                        "bool": {
                            "must": [{
                                "range": {
                                    [`measurements.${measurementsUnit}.${size}.${fit.searchName}Min`]: {
                                        "gte": parseFloat(fit.searchValue),
                                    }
                                }
                            }]
                        }
                    }
                    tempList.push(subSizePayload)
                }

                payload.query.bool.should.push({
                    "bool": {
                        "should": [
                            ...tempList
                        ]
                    }
                })

                payload.sort.push({
                    "_script": {
                        "type": "number",
                        "script": {
                            "lang": "painless",
                            "source": `List allSizes = new ArrayList(params._source.measurements.${measurementsUnit}.keySet());List sizeVar = []; for(def item = 0; item < allSizes.size(); item++){if(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min != null){if((Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)}) >= 0){sizeVar.add(Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)})}}} double min = Integer.MAX_VALUE; for (double i: sizeVar){if (min > i){min = i;}} return min`
                        },
                        "order": "asc"
                    }
                }

                )

            }
        }

        // for Tops Only
        else if ((bust !== '' || chest !== '' || shoulder !== '' || topWaist !== '') && (outseam == '' && inseam == '' && hip == '' && bottomWaist == '')) {
            for (let fit of allSearch) {
                let subExistsPayload = {
                    "exists": {
                        "field": `measurements.${measurementsUnit}.*.${fit.searchName}Min`
                    }
                }
                payload.query.bool.should.push(subExistsPayload)
                let tempList = []
                for (let size of sizeCode) {
                    let subSizePayload = {
                        "bool": {
                            "must": [{
                                "range": {
                                    [`measurements.${measurementsUnit}.${size}.${fit.searchName}Min`]: {
                                        "gte": parseFloat(fit.searchValue),
                                    }
                                }
                            }]
                        }
                    }
                    tempList.push(subSizePayload)
                }

                payload.query.bool.should.push({
                    "bool": {
                        "minimum_should_match": 1,
                        "should": [
                            ...tempList
                        ]
                    }
                })

                payload.sort.push(

                    {
                        "_script": {
                            "type": "number",
                            "script": {
                                "lang": "painless",
                                "source": `List allSizes = new ArrayList(params._source.measurements.${measurementsUnit}.keySet());List sizeVar = []; for(def item = 0; item < allSizes.size(); item++){if(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min != null){if((Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)}) >= 0 && (Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)}) <= 2){sizeVar.add(Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)})}}} double min = Integer.MAX_VALUE; for (double i: sizeVar){if (min > i){min = i;}} return min`
                            },
                            "order": "asc"
                        }
                    }

                )

            }
        }

        // for Bottoms Only
        else if ((bust == '' && chest == '' && shoulder == '' && topWaist == '') && (outseam !== '' || inseam !== '' || hip !== '' || bottomWaist !== '')) {
            for (let fit of allSearch) {

                let subExistsPayload = {
                    "exists": {
                        "field": `measurements.${measurementsUnit}.*.${fit.searchName}Min`
                    }
                }
                payload.query.bool.should.push(subExistsPayload)
                let tempList = []
                for (let size of sizeCode) {
                    let subSizePayload = {
                        "bool": {
                            "must": [{
                                "range": {
                                    [`measurements.${measurementsUnit}.${size}.${fit.searchName}Min`]: {
                                        "gte": parseFloat(fit.searchValue),
                                    }
                                }
                            }]
                        }
                    }
                    tempList.push(subSizePayload)
                }

                payload.query.bool.should.push({
                    "bool": {
                        "minimum_should_match": 1,
                        "should": [
                            ...tempList
                        ]
                    }
                })

                payload.sort.push(

                    {
                        "_script": {
                            "type": "number",
                            "script": {
                                "lang": "painless",
                                "source": `List allSizes = new ArrayList(params._source.measurements.${measurementsUnit}.keySet());List sizeVar = []; for(def item = 0; item < allSizes.size(); item++){if(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min != null){if((Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)}) >= 0 && (Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)}) <= 2){sizeVar.add(Double.parseDouble(String.valueOf(params._source.measurements.${measurementsUnit}[allSizes[item]].${fit.searchName}Min)) - ${parseFloat(fit.searchValue)})}}} double min = Integer.MAX_VALUE; for (double i: sizeVar){if (min > i){min = i;}} return min`
                            },
                            "order": "asc"
                        }
                    }
                )

            }
        } else {
            console.log('This product has error')
        }




        gender.forEach((values, i) =>
            styleQuery.bool.should[i] = {
                "match_phrase": {
                    "gender": values,
                }
            }
        )
        payload.from = froms;


        let returnResult = new Array();

        for (categorie of categoriesList) {
            payload.query.bool.filter[0].bool.must = [];
            payload.query.bool.filter[0].bool.must = [
                styleQuery,
                genderQuery,
                countryQuery
            ]
            returnResult.push(
                {
                    query: payload,
                    terms: {
                        "term": {
                            "categories.keyword": categorie
                        }
                    },
                    categorie: categorie
                }
            )
        }

        return returnResult


    },


    queryTopLogic: async (finalResult, categorie) => {

        json_data = finalResult.body.hits.hits
        if (json_data.length !== 0) {

            json_data[0]["TopCategory"] = categorie

        }

        return json_data[0]


    }
}
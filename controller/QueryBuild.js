const {
    payload
} = require("../Modal/InitialQuery_Modal")
module.exports = {
    QueryBuild: async ({
        brand,
        categories,
        style,
        color,
        gender,
        platform,
        froms,
        sort,
        search,
        location,
        inseam,
        outseam,
        shoulder,
        hip,
        bust,
        chest,
        topWaist,
        bottomWaist,
        sizeCode,
        measurementsUnit
    }) => {


        // This is to check the waist value
        let waist = ''
        if ((topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined") && (bottomWaist === '' || bottomWaist === 0 || typeof bottomWaist === "undefined")) {
            waist = topWaist
        } else if ((bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined") && (topWaist === '' || topWaist === 0 || typeof topWaist === "undefined")) {
            waist = bottomWaist
        } else if ((topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined") && (bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined")) {
            waist = topWaist
        } else {
            waist = ''
        }



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




        // Checking the input values
        let allSearch = []
        let choosenList = []

        let brandsQuery = {
            "bool": {
                "should": []
            }
        }

        let platformQuery = {
            "bool": {
                "should": []
            }
        }

        let categoriesQuery = {
            "bool": {
                "should": []
            }
        }
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
        let colorQuery = {
            "bool": {
                "should": []
            }
        };
        let countryQuery = {
            "bool": {
                "must": []
            }
        };

        let NoSortInidicator = false

        color.forEach((values, i) => {
            colorQuery.bool.should[i] = {
                "match_phrase": {
                    "style.color": values
                }
            }
        })

        location !== "" && location !== null && countryQuery.bool.must.push({
            "match": {
                "location": location
            }
        })



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




        if (gender[0] === "men") {
            if (chest !== "" && chest !== 0 && typeof chest !== "undefined") {
                allSearch.push({
                    searchName: 'menOvalChest',
                    searchValue: chest
                })
                choosenList.push('menOvalChestMin')
            }

        }
        if (gender[0] === "women") {
            if (bust !== "" && bust !== 0 && typeof bust !== "undefined") {
                allSearch.push({
                    searchName: 'womenOvalBust',
                    searchValue: bust
                })
                choosenList.push('womenOvalBustMin')
            }
        }

        // for Dresses
        if (((bust !== '' && bust !== 0 && typeof bust !== "undefined") || (chest !== "" && chest !== 0 && typeof chest !== "undefined") || (shoulder !== "" && shoulder !== 0 && typeof shoulder !== "undefined") || (topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined")) && ((outseam !== "" && outseam !== 0 && typeof outseam !== "undefined") || (inseam !== "" && inseam !== 0 && typeof inseam !== "undefined") || (hip !== "" && hip !== 0 && typeof hip !== "undefined") || (bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined"))) {

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
                })

            }
        }

        // for Tops Only
        else if (((bust !== '' && bust !== 0 && typeof bust !== "undefined") || (chest !== "" && chest !== 0 && typeof chest !== "undefined") || (shoulder !== "" && shoulder !== 0 && typeof shoulder !== "undefined") || (topWaist !== '' && topWaist !== 0 && typeof topWaist !== "undefined")) && ((outseam === "" || outseam === 0 || typeof outseam === "undefined") || (inseam === "" || inseam === 0 || typeof inseam === "undefined") || (hip === "" || hip === 0 || typeof hip === "undefined") || (bottomWaist === '' || bottomWaist === 0 || typeof bottomWaist === "undefined"))) {
            for (let fit of allSearch) {
                let subExistsPayload = {
                    "exists": {
                        "field": `measurements.${measurementsUnit}.*.${fit.searchName}Min`
                    }
                }
                payload.query.bool.must.push(subExistsPayload)
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

                payload.query.bool.must.push({
                    "bool": {
                        "minimum_should_match": 1,
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
                })

            }
        }

        // for Bottoms Only
        else if (((bust === '' || bust === 0 || typeof bust === "undefined") || (chest === "" || chest === 0 || typeof chest === "undefined") || (shoulder === "" || shoulder === 0 || typeof shoulder === "undefined") || (topWaist === '' || topWaist === 0 || typeof topWaist === "undefined")) && ((outseam !== "" && outseam !== 0 && typeof outseam !== "undefined") || (inseam !== "" && inseam !== 0 && typeof inseam !== "undefined") || (hip !== "" && hip !== 0 && typeof hip !== "undefined") || (bottomWaist !== '' && bottomWaist !== 0 && typeof bottomWaist !== "undefined"))) {
            for (let fit of allSearch) {
                let subExistsPayload = {
                    "exists": {
                        "field": `measurements.${measurementsUnit}.*.${fit.searchName}Min`
                    }
                }
                payload.query.bool.must.push(subExistsPayload)
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

                payload.query.bool.must.push({
                    "bool": {
                        "minimum_should_match": 1,
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
                })

            }
        }



        platform.forEach((values, i) => {
            platformQuery.bool.should[i] = {
                "match_phrase": {
                    "platform": values,
                }
            }
        })

        brand.forEach((values, i) => {
            brandsQuery.bool.should[i] = {
                "match_phrase": {
                    "brand.name": values,
                }
            }
        })

        categories.forEach((values, i) => {
            categoriesQuery.bool.should[i] = {
                "match_phrase": {
                    "categories": values,
                }
            }
        })


        gender.forEach((values, i) =>
            genderQuery.bool.should[i] = {
                "match_phrase": {
                    "gender": values,
                }
            }
        )

        style.forEach((values, i) => {
            styleQuery.bool.should[i] = {
                "match_phrase": {
                    "style.style": values,
                }
            }
        })

        if (brand?.length !== 0) {

            delete payload.aggs["brand"]
        } else {
            if (payload.aggs["brand"] === undefined) payload.aggs["brand"] = {
                "terms": {
                    "field": "brand.name.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            }
        }


        if (platform?.length !== 0) {
            delete payload.aggs["platform"]
        } else {

            if (payload.aggs["platform"] === undefined) payload.aggs["platform"] = {
                "terms": {
                    "field": "platform.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            }

        }

        if (categories?.length !== 0) {
            delete payload.aggs["categories"]
        } else {
            if (payload.aggs["categories"] === undefined) payload.aggs["categories"] = {
                "terms": {
                    "field": "categories.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            }
        }

        if (style?.length !== 0) {
            delete payload.aggs["style"]
        } else {
            if (payload.aggs["style"] === undefined) payload.aggs["style"] = {
                "terms": {
                    "field": "style.style.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            }
        }
        if (search?.length !== 0) {
            let searching = search.startsWith('http')
            if (searching) {
                payload.from = 0;
                payload.query.bool.filter[0].bool.must = [];
                payload.query.bool.filter[0].bool.must.push({
                    "match_phrase": {
                        "deepLink": search
                    }
                })
            } else {
                if (sort === "" && ((bust === '' || bust === 0 || typeof bust === "undefined") || (chest === "" || chest === 0 || typeof chest === "undefined") || (shoulder === "" || shoulder === 0 || typeof shoulder === "undefined") || (topWaist === '' || topWaist === 0 || typeof topWaist === "undefined") || ((outseam === "" || outseam === 0 || typeof outseam === "undefined") || (inseam === "" || inseam === 0 || typeof inseam === "undefined") || (hip === "" || hip === 0 || typeof hip === "undefined") || (bottomWaist === '' || bottomWaist === 0 || typeof bottomWaist === "undefined")))) {
                    NoSortInidicator = true;
                    payload.sort.push({
                        "price.values": {
                            "order": "asc"
                        }
                    })
                    payload.query.bool.must.push({
                        "exists": {
                            "field": "measurements"
                        }

                    }, {

                        "bool": {
                            "should": [{
                                    "match_phrase": {
                                        "name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "brand.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "manufacturer.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "style.style": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "platform": search
                                    }
                                }
                            ]
                        }


                    })
                }
                else if (sort !== "feature" && sort !== undefined && sort !== "" && sort !== null) {
                    payload.sort.unshift({
                        "price.values": {
                            "order": sort
                        }
                    }, {
                        "lastModified": {
                            "order": "desc"
                        }
                    })
                    payload.query.bool.must.push({
                        "exists": {
                            "field": "measurements"
                        }

                    }, {

                        "bool": {
                            "should": [{
                                    "match_phrase": {
                                        "name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "brand.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "manufacturer.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "style.style": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "platform": search
                                    }
                                }
                            ]
                        }


                    })

                }
                else if (sort === "feature") {
                    payload.query.bool.must.push({
                        "exists": {
                            "field": "measurements"
                        }

                    },

                    {
                        "exists": {
                            "field": "feature_match"
                        }

                    }, {

                        "bool": {
                            "should": [{
                                    "match_phrase": {
                                        "name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "brand.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "manufacturer.name": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "style.style": search
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "platform": search
                                    }
                                }

                            ]
                        }


                    })
                }

                payload.from = froms;

                payload.query.bool.filter[0].bool.must = [];
                payload.query.bool.filter[0].bool.must = [
                    brandsQuery,
                    platformQuery,
                    categoriesQuery,
                    styleQuery,
                    genderQuery,
                    colorQuery,
                    countryQuery
                ]
            }
        } else {
            payload.from = froms;
            payload.query.bool.filter[0].bool.must = [];
            payload.query.bool.filter[0].bool.must = [
                brandsQuery,
                platformQuery,
                categoriesQuery,
                styleQuery,
                genderQuery,
                colorQuery,
                countryQuery
            ]

        }
        if (sort === "" && ((bust === '' || bust === 0 || typeof bust === "undefined") && (chest === "" || chest === 0 || typeof chest === "undefined") && (shoulder === "" || shoulder === 0 || typeof shoulder === "undefined") && (topWaist === '' || topWaist === 0 || typeof topWaist === "undefined") && ((outseam === "" || outseam === 0 || typeof outseam === "undefined") && (inseam === "" || inseam === 0 || typeof inseam === "undefined") && (hip === "" || hip === 0 || typeof hip === "undefined") && (bottomWaist === '' || bottomWaist === 0 || typeof bottomWaist === "undefined")))) {
            NoSortInidicator = true;
            payload.sort.push({
                "price.values": {
                    "order": "asc"
                }
            })
        } else if (sort !== "feature" && sort !== undefined && sort !== "" && sort !== null) {
            NoSortInidicator = true;
            payload.sort.unshift({
                "price.values": {
                    "order": sort
                }
            }, {
                "lastModified": {
                    "order": "desc"
                }
            })

        } else if (sort === "feature") {
            payload.query.bool.must.push({
                "exists": {
                    "field": "feature_match"
                }

            })
        }
        return {
            query: payload,
            measurementsUnit: measurementsUnit,
            allSearch: allSearch,
            choosenList: choosenList,
            NoSortInidicator: NoSortInidicator

        }



    },
    queryLogic: async (finalResult, sizeType, choosenFit, choosenList, NoSortInidicator) => {
        let json_data = finalResult.body.hits.hits

        let allProducts = [];
        let allFeatureMatchProducts = []

        for (let product of json_data) {

            if (product._source.hasOwnProperty("trackingUrl")) {
                product._source.deepLink=product._source.trackingUrl
            }

            // if (product._source.hasOwnProperty("gender")) {
            //     product._source.deepLink=product._source.gender
            // }

            let measurement_list = product._source.measurements[sizeType]

            const keys = Object.keys(measurement_list)

            for (let fitDetails of choosenFit) {
                let nearMatchSize = ''
                let nearMatchValue = 0
                let nearMatchValueDifference = -1

                keys.forEach((key, index) => {


                    if (((measurement_list[key][fitDetails["searchName"] + "Min"] - fitDetails["searchValue"]) >= 0) && nearMatchValueDifference === -1) {
                        nearMatchSize = key
                        nearMatchValue = measurement_list[key][fitDetails["searchName"] + "Min"]
                        nearMatchValueDifference = parseFloat(measurement_list[key][fitDetails["searchName"] + "Min"] - fitDetails["searchValue"]).toFixed(2)

                    } else if (((measurement_list[key][fitDetails["searchName"] + "Min"] - fitDetails["searchValue"]) >= 0) && ((measurement_list[key][fitDetails["searchName"] + "Min"] - fitDetails["searchValue"]) <= nearMatchValueDifference)) {
                        nearMatchSize = key
                        nearMatchValue = measurement_list[key][fitDetails["searchName"] + "Min"]
                        nearMatchValueDifference = parseFloat(measurement_list[key][fitDetails["searchName"] + "Min"] - fitDetails["searchValue"]).toFixed(2)
                    }

                });

                if (nearMatchValueDifference !== -1) {
                    if (product._source.hasOwnProperty('nearMatchFit')) {

                        product._source.nearMatchFit.push({
                            matchedSizeName: fitDetails.searchName,
                            matchedProductSizeKey: nearMatchSize,
                            matchProductSizeValue: parseFloat(nearMatchValue),
                            DifferProductUserSize: parseFloat(parseFloat(nearMatchValueDifference).toFixed(2))
                        })
                    } else {
                        product._source.nearMatchFit = []
                        product._source.nearMatchFit.push({
                            matchedSizeName: fitDetails.searchName,
                            matchedProductSizeKey: nearMatchSize,
                            matchProductSizeValue: parseFloat(nearMatchValue),
                            DifferProductUserSize: parseFloat(parseFloat(nearMatchValueDifference).toFixed(2))
                        })
                    }


                }


            }
            if (product._source.hasOwnProperty('nearMatchFit')) {
                if (product._source.hasOwnProperty('feature_match')) {
                    allFeatureMatchProducts.push(product._source)
                } else {
                    allProducts.push(product._source)
                }
            }




            // priority wise sorting
            let ar1 = [];
        
            product._source.nearMatchFit !==undefined?product._source.nearMatchFit.map(e => ar1.push(e.matchedProductSizeKey)):""

            if (ar1.every((sizeKey) => sizeKey === ar1[0])) {
                continue
            } else {
                let bestFit = {}
                let userData = {}

                for (let subFit in product._source.nearMatchFit) {

                    userData[`${product._source.nearMatchFit[subFit].matchedSizeName}Min`] = product._source.nearMatchFit[subFit].matchProductSizeValue - product._source.nearMatchFit[subFit].DifferProductUserSize
                }

                for (let subSize of choosenList) {
                    let subSizeKeyList = []
                    let subSizeValueList = []

                    for (let subFit of product._source.nearMatchFit) {

                        if (!isNaN(product._source.measurements[sizeType][subFit.matchedProductSizeKey][subSize])) {
                            subSizeKeyList.push(subFit.matchedProductSizeKey)
                            subSizeValueList.push(parseFloat(product._source.measurements[sizeType][subFit.matchedProductSizeKey][subSize]))
                        }

                    }
                    bestFit[subSize] = {
                        sizeKeyList: subSizeKeyList,
                        sizeValueList: subSizeValueList

                    }
                }


                let localNearMatch = []
                for (let subSizeMax of choosenList) {

                    let maxValue = Math.max(...bestFit[subSizeMax].sizeValueList)
                    let maxValueIndex = bestFit[subSizeMax].sizeValueList.indexOf(maxValue)
                    let maxKey = bestFit[subSizeMax].sizeKeyList[maxValueIndex]


                    if (maxKey !== undefined) {
                        localNearMatch.push({
                            "matchedSizeName": subSizeMax.replace('Min', ''),
                            "matchedProductSizeKey": maxKey,
                            "matchProductSizeValue": maxValue,
                            "DifferProductUserSize": parseFloat(parseFloat(parseFloat(parseFloat(maxValue) - parseFloat(userData[subSizeMax]).toFixed(2))).toFixed(2))

                        }, )
                    }
                }

                product._source.nearMatchFit = localNearMatch

            }

        }
        if (NoSortInidicator !== true) {
            if (choosenList.includes('menOvalChestMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    for (let size1 of a.nearMatchFit) {

                        if (size1.matchedSizeName === "menOvalChest") {

                            Asize1 = size1.DifferProductUserSize
                        }
                    }
                    for (let size2 of b.nearMatchFit) {
                        if (size2.matchedSizeName === "menOvalChest") {
                            Bsize1 = size2.DifferProductUserSize
                        }
                    }
                    return Asize1 - Bsize1;
                });
            } else if (choosenList.includes('womenOvalBustMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    if (a.hasOwnProperty('nearMatchFit') && b.hasOwnProperty('nearMatchFit')) {
                        for (let size1 of a.nearMatchFit) {
                            if (size1.matchedSizeName === "womenOvalBust") {
                                Asize1 = size1.DifferProductUserSize
                            }
                        }
                        for (let size2 of b.nearMatchFit) {
                            if (size2.matchedSizeName === "womenOvalBust") {
                                Bsize1 = size2.DifferProductUserSize
                            }
                        }
                        return Asize1 - Bsize1;
                    }
                });
            } else if (choosenList.includes('waistMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    for (let size1 of a.nearMatchFit) {
                        if (size1.matchedSizeName === "waist") {
                            Asize1 = size1.DifferProductUserSize
                        }
                    }
                    for (let size2 of b.nearMatchFit) {
                        if (size2.matchedSizeName === "waist") {
                            Bsize1 = size2.DifferProductUserSize
                        }
                    }
                    return Asize1 - Bsize1;
                });
            } else if (choosenList.includes('acrossShoulderMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    for (let size1 of a.nearMatchFit) {
                        if (size1.matchedSizeName === "acrossShoulder") {
                            Asize1 = size1.DifferProductUserSize
                        }
                    }
                    for (let size2 of b.nearMatchFit) {
                        if (size2.matchedSizeName === "acrossShoulder") {
                            Bsize1 = size2.DifferProductUserSize
                        }
                    }
                    return Asize1 - Bsize1;
                });
            } else if (choosenList.includes('hipMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    if (a.hasOwnProperty('nearMatchFit') && b.hasOwnProperty('nearMatchFit')) {
                        for (let size1 of a.nearMatchFit) {
                            if (size1.matchedSizeName === "hip") {
                                Asize1 = size1.DifferProductUserSize
                            }
                        }
                        for (let size2 of b.nearMatchFit) {
                            if (size2.matchedSizeName === "hip") {
                                Bsize1 = size2.DifferProductUserSize
                            }
                        }
                        return Asize1 - Bsize1;
                    }
                });
            } else if (choosenList.includes('inSeamLengthMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    for (let size1 of a.nearMatchFit) {
                        if (size1.matchedSizeName === "inSeamLength") {
                            Asize1 = size1.DifferProductUserSize
                        }
                    }
                    for (let size2 of b.nearMatchFit) {
                        if (size2.matchedSizeName === "inSeamLength") {
                            Bsize1 = size2.DifferProductUserSize
                        }
                    }
                    return Asize1 - Bsize1;
                });
            } else if (choosenList.includes('outSeamLengthMin')) {
                allProducts.sort(function(a, b) {
                    let Asize1 = 0
                    let Bsize1 = 0
                    for (let size1 of a.nearMatchFit) {
                        if (size1.matchedSizeName === "outSeamLength") {
                            Asize1 = size1.DifferProductUserSize
                        }
                    }
                    for (let size2 of b.nearMatchFit) {
                        if (size2.matchedSizeName === "outSeamLength") {
                            Bsize1 = size2.DifferProductUserSize
                        }
                    }
                    return Asize1 - Bsize1;
                });
            }
            allProducts.unshift(...allFeatureMatchProducts)
        }
        finalResult.body.hits.hits = allProducts

        return finalResult

        
    },
    getSizeCode: async ({
        country
    }) => {
        return {


            "query": {
                "bool": {
                    "must": [{
                            "exists": {
                                "field": "measurements"
                            }

                        },
                        (country !== null && country !== "Global" && country !== undefined && country !== "") ? {
                            "match": {
                                "location": country !== null ? country : ""
                            }
                        } : {
                            "match_all": {}
                        }
                    ]
                }
            },
            "size": 0,
            "aggs": {
                "brand": {
                    "terms": {
                        "field": "brand.name.keyword",
                        "size": 100000,
                        "min_doc_count": 1
                    }
                },
                "size": {
                    "terms": {
                        "field": "sizes.keyword",
                        "size": 100000,
                        "min_doc_count": 1
                    }
                },
                "categories": {
                    "terms": {
                        "field": "categories.keyword",
                        "size": 100000,
                        "min_doc_count": 1
                    }
                }
            }
        }

    }


}
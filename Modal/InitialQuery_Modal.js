module.exports = {
    payload: {
        "_source": ["name", "deepLink", "platform", "sizes", "price", "imageUrl", "feature_match", "style", "measurements", "gender","brand"],
        "query": {
            "bool": {
                "must": [
                    {
                        "exists": {
                            "field": "measurements"
                        }

                    },
                ],
                "should": [],
                "must_not": [],

                "filter": [
                    {
                        "bool": {
                            "must": [],
                            "must_not": [],
                            "should": []
                        }
                    }
                ]
            }
        },
        "size": 50,
        "from": 0,
        "sort": [],
        "aggs": {
            "brand": {
                "terms": {
                    "field": "brand.name.keyword",
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
            },
            "gender": {
                "terms": {
                    "field": "gender.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            },
            "color": {
                "terms": {
                    "field": "style.color.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            },
            "style": {
                "terms": {
                    "field": "style.style.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            },
            "platform": {
                "terms": {
                    "field": "platform.keyword",
                    "size": 100000,
                    "min_doc_count": 1
                }
            }
        }
    }
}
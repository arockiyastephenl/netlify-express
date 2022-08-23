module.exports = {
    payload: {
        // "index": "logs-qi-95650-i-colakin_size_products",
        // "query": {

        "_source": ["deepLink", "imageUrl", "measurements", "gender"],
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
                    },
                    {
                        "term": {
                        }
                    }
                ]
            }
        },
        "size": 1,
        "from": 0,
        "sort": [
            // { "price.values": { "order": "asc" } },
            // { "lastModified": { "order": "desc" } }
        ],

        // }
    }
}
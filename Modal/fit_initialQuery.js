module.exports = {
  payload: {
    _source: [
      "name",
      "deepLink",
      "price.formattedValue",
      "price.currency",
      "sizes",
      "brand",
      "measurements",
    ],
    query: {
      bool: {
        must: [
          {
            exists: {
              field: "measurements",
            },
          },
        ],
        should: [],
        must_not: [],
        filter: [
          {
            bool: {
              must: [],
              must_not: [],
              should: [],
            },
          },
        ],
      },
    },
    size: 100,
    from: 0,
    collapse: {
      field: "brand.name.keyword",
      inner_hits: {
        name: "brand.name.keyword",
        size: 5,
        sort: [
          {
            lastModified: {
              order: "desc",
            },
          },
        ],
      },
      max_concurrent_group_searches: 4,
    },
    sort: [],
  },
};

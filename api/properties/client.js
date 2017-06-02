/**
 * Created by FEMI on 4/27/2016.
 */

module.exports = {
    properties: {
        user_id: { type: "integer"},
        line_id: { type: "integer"},
        full_name: { type: "string" },//name of contact person
        company: { type: "string" },
        logo: { type: "string", "index":    "no" },
        description: {type: "string"},
        phone: { type: "string" },
        email: { type: "string" },
        address: {
            properties: {
                city: { type: "string" },
                zip: { type: "string" },
                state: { type: "string" },
                country: { type: "string" },
                street: { type: "string"},
                "coordinate": {
                    "type":"geo_point"
                }
            }
        },
        last_visited: {
            "type":   "date",
            "format" : "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd"
        },
        created: {
            "type":   "date"
        }
    }
};

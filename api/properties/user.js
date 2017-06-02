/**
 * Created by Emmanuel on 4/27/2016.
 */


module.exports = {
    properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        territories: { type: "string" },
        sale_type: { type: "string"},
        group_description: { type: "string"},
        industries: { type: "string"},
        co_workers: { type: "string"},
        sign_up_stage: { type: "integer"},

        home_address: {
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
        office_address: {
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
        rep_type: { type: "string" },
        boss:{
            properties: {
                first_name: { type: "string" },
                last_name: { type: "string" },
                email: { type: "string" },
                phone: { type: "string" },
                office_address: {
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
                }
            }
        },

        employers: {"type" : "string"},
        user_id: {type: "string"}
    },
    created: {
        "type":   "date"
    }
};

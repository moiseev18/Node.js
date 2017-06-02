/**
 * Created by Emmanuel on 4/29/2016.
 */
module.exports = {
    properties: {
        title: {type:"string"},
        description: {type:"string"},
        address: {
            properties: {
                city: {type: "string"},
                zip: {type: "string"},
                state: {type: "string"},
                country: {type: "string"},
                street: {type: "string"},
                coordinate: {
                    "type": "geo_point"
                }
            }
        },
        territory: {type: "string"},
        user_id: {type: "string"},
        client_id: {type: "string"},
        created: {
            "type":   "date"
        }

    }
};

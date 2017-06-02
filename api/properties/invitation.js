/**
 * Created by Emmanuel on 4/29/2016.
 */
module.exports = {
    properties: {
        first_name: {type: "string"},
        last_name: {type: "string"},
        email: {type: "string"},
        phone: {type: "string"},
        address: {
            properties: {
                city: {type: "string"},
                zip: {type: "string"},
                state: {type: "string"},
                country: {type: "string"},
                street: {type: "string"}

            }
        },
        territory: {type: "string"},
        user_id: {type: "string"},
        created: {
            "type":   "date"
        }
    }
};

/**
 * Created by Emmanuel on 4/29/2016.
 */
module.exports = {
    properties: {
        title: {type: "string"},
        user_id: {type: "string"},
        "client_id": {"type": "string"  },
        "date": {
            "type":   "date",
            "format" : "yyyy-MM-dd"
        },
        "time_range": {
            "properties": {
                "start_time": {
                    "type": "date",
                    "format": "hour_minute"
                },
                "end_time": {
                    "type": "date",
                    "format": "hour_minute"
                }
            }
        },
        location: {
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
        reminder: {
            "type": "integer"
        },
        visited: {
            "type": "boolean"
        },
        status: { type: "integer"},
        created: {
            "type":   "date"
        }
    }

};

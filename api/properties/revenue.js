/**
 * Created by Femi on 7/28/2016.
 */
module.exports = {
    properties: {
        user_id: { type: "string" },
        line_id: { type: "string" },
        goal_id: { type: "string" },
        client_id: { type: "string" },
        title: { type: "string", "index":    "no"  },
        value: { type: "float" },
        date_sold: {
            "type":   "date",
            "format" : "yyyy-MM-dd"
        },
        created: {
            "type":   "date"
        }
    }

};
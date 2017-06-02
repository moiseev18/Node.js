/**
 * Created by FEMI on 5/7/2016.
 */
module.exports = {
    properties: {
        user_id: { type: "string" },
        object_id: { type:"string" },
        title: { type: "string"  },
        description: { type: "string", "index":    "no"  },
        type: { type: "string" },//Sales (goalController.TYPE.SALES), Clients (goalController.TYPE.CLIENTS) or Visits (goalController.TYPE.VISITS)
        target: { type: "string" },
        value: { type: "string" },
        status: { type: "integer" },
        date: {
            type:   "date",
            format : "yyyy-MM-dd HH:mm:ss"
        },
        created: {
            "type":   "date"
        }
    }
};

/**
 * Created by FEMI on 5/7/2016.
 */

module.exports = {
    properties: {
        user_id: { type: "string" },
        goal_id: { type: "string" },
        goal_type: { type: "string" },//Sales (goalController.TYPE.SALES), Clients (goalController.TYPE.CLIENTS) or Visits (goalController.TYPE.VISITS)        value: { type: "boolean" },
        comment: { type: "string", "index":    "no"  },
        "date": {
            "type":   "date",
            "format" : "yyyy-MM-dd HH:mm:ss"
        },
        created: {
            "type":   "date"
        }
    }
};
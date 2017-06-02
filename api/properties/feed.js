/**
 * Created by FEMI on 5/7/2016.
 */
module.exports = {
    properties: {
        user_id: { type: "string" },
        action: { type: "string" },
        object_id: { type:"string" },
        subject_id: { type: "string" },
        comment: { type: "string", "index": "no" },
        type: { type: "string" },
        public: { type: "boolean" },
        date: {
            type:   "date",
            format : "yyyy-MM-dd HH:mm:ss"
        },
        created: {
            "type":   "date"
        }
    }
};

/**
 * Created by Emmanuel on 4/16/2016.
 */

module.exports = {

    multipleDataResponse: function(array,dataMeta)
    {
        var response  = {},
            meta = {};


        if(dataMeta.statusCode)
        {
            meta.status_code = dataMeta.statusCode;
            meta.developer_message = statusToMessage(dataMeta.statusCode);
        }
        if(dataMeta.mssg)
        {
            meta.user_message = dataMeta.mssg;
        }
        if(dataMeta.totalCount)
        {
            meta.total_count = dataMeta.totalCount;
        }
        if(dataMeta.previous_page)
        {
            meta.previous_page = dataMeta.previous_page;
        }
        if(dataMeta.current_page)
        {
            meta.current_page = dataMeta.current_page;
        }
        if(dataMeta.next_page)
        {
            meta.next_page = dataMeta.next_page;
        }

        if(dataMeta.response_time)
        {
            meta.response_time = dataMeta.response_time;
        }

        response._meta = meta;

        response[dataMeta.dataName ? dataMeta.dataName : "data"] = array;

        return response;
    },

    singleDataResponse: function(data,dataMeta)
    {
        var response  = {},
            meta = {};


        if(dataMeta.statusCode)
        {
            meta.status_code = dataMeta.statusCode;
            meta.developer_message = statusToMessage(dataMeta.statusCode);
        }
        if(dataMeta.mssg)
        {
            meta.user_message = dataMeta.mssg;
        }
        if(dataMeta.response_time)
        {
            meta.response_time = dataMeta.response_time;
        }
        response._meta = meta;

        response[dataMeta.dataName ? dataMeta.dataName : "data"] = data;

        return response;
    },


    generalResponse: function(info)
    {
        var response = {};
        if(info.statusCode)
        {
            response.status_code = info.statusCode;
            response.developer_message = statusToMessage(info.statusCode);
        }
        response.user_message = info.mssg;
        if(info.extra)
        {
            response.extra = info.extra;
        }
        return response;
    }

};


function statusToMessage(statusCode)
{
    var errorMssg = "";
    if(statusCode)
    {
        switch (statusCode)
        {
            case 200:
                errorMssg = "Request OK";
                break;
            case 201:
                errorMssg = "New resource created";
                break;
            case 404:
                errorMssg = "Resource not found";
                break;
            case 401:
                errorMssg = "Unauthorized Request";
                break;
            case 400:
                errorMssg = "Bad request";
                break;
            case 503:
                errorMssg = "Internal server error"
        }
    }

    return errorMssg;
}
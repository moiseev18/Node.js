/**
 * Created by femi on 8/9/2016.
 */
var twilio = require('twilio');
//var twilioClient = new twilio.RestClient('AC52b0adc1dd867c519dac837da09b0cdd', '38f72a03892dd29ce1228414bb5c0bd2');
var myTwilio={
    getInstance:function() {
        return twilio;
    },
    client: function() {
        return new twilio.RestClient('AC52b0adc1dd867c519dac837da09b0cdd', '38f72a03892dd29ce1228414bb5c0bd2');
    },
    FROM: '+16822384116',

};
//myTwilio.client=new twilio.RestClient('AC52b0adc1dd867c519dac837da09b0cdd', '38f72a03892dd29ce1228414bb5c0bd2');

module.exports = myTwilio;
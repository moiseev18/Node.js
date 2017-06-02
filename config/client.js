/**
 * Created by Emmanuel on 4/17/2016.
 */

var  industries=[
    {id:1, name:"Health"},
    {id:2, name:"Information Technology"},
    {id:3, name:"Household and Supplies"}
];
module.exports = {

    maintenance_mode : false,

    version_android : "0.0.1",
    update_required_android: false,

    version_ios: "0.0.1",
    update_required_ios: false,
    client: 'android',
    industries: JSON.stringify(industries)

};

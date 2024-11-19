const mongoose = require('mongoose');
const config = require("config")
const dbgr= require("debug")("development: mongoose");
 
mongoose
.connect(`${config.get("MONGODB_URI")}/moist`) // this works in the basis of environmental variable, if develeopment then development
.then(function(){
    dbgr("connected")
})
.catch(function(err){
    dbgr(err)
})

module.exports = mongoose.connection
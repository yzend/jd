var express =require("express");
var app = new express();
app.use(express.static("www"));
app.listen(3000,function(){
    console.log("linkstart...")
})
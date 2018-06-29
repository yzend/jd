var express = require("express");
var bodyParser =require("body-parser");
var cookieParser =require("cookie-parser");
var superAgent =require("superagent");
var fs =require("fs");
var app = new express();
app.use(express.static("www"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
var usersarr =[];
var tel;
app.get("/setcode",function(req,res){
    console.log(req.query.code)
    var have=usersarr.find(function(e){
       return e.tel==req.query.tel;
    })
    if(have){
        console.log("存在");
        return res.json("1");
    }else{
        tel = req.query.tel;
        var url = "http://sms.tehir.cn/code/sms/api/v1/send?srcSeqId=123&account=18268882513&password=QWer1234&mobile="+req.query.tel+"&code="+req.query.code+"&time=1";
        superAgent.get(url).end(function (err,data) {  
            if(err){
                res.json(err);
            }else{
                res.json(data.body);
            }
        })
    }
    
    
})

app.post("/register",function(req,res){
    
        req.body.tel=tel;
        req.body.shopcar=[];
        usersarr.push(req.body);
        fs.writeFile("www/json/user.json",JSON.stringify(usersarr),function(err){
            if(err){
                console.log("写入失败");
                res.json("1")
            }else{
                console.log("写入成功");
                res.json({
                    "h":0,
                    "username":req.body.username
                });
            }
        });
})

app.post("/register/had",function(req,res){
    var have=usersarr.find(function(e){
        return e.username==req.body.username;
     })
     if(have){
         res.json("1");
     }else{
         res.json("0");
     }
})
app.post("/login",function(req,res){
    console.log(req.body);
    // res.json(req.body)
    var have=usersarr.find(function(e){
        return (e.username==req.body.username || req.body.username==e.tel);
    })
    // console.log(have);
    if(have){
        if(req.body.pwd==have.password){
            res.json({
                "code":1,
                "username":req.body.username,
                "text":"密码正确"
            })
        }else{
            res.json({
                "code":0,
                "text":"密码错误"
            })
        }
    }else{
        res.json({
            "code":0,
            "text":"用户名错误"
        })
    }
})
app.post("/addgoods",function(req,res){
    // console.log(req.body);
    // console.log(req.cookies.username);
    var index=usersarr.findIndex(function(e){
        return e.username==req.cookies.username;
     })
     var goodindex =usersarr[index].shopcar.findIndex(function (e) { 
         console.log(e); 
        return e.content == req.body.content 
     })
     console.log(goodindex);
    //  没有该商品
     if(goodindex == -1){
        req.body.num = 1;
        usersarr[index].shopcar.push(req.body);
        console.log( "新商品");
     }else{
         usersarr[index].shopcar[goodindex].num++;
         console.log("更改数量");
     }
     fs.writeFile("www/json/user.json",JSON.stringify(usersarr),function(err){
        if(err){
            console.log("写入失败");
            
        }else{
            console.log("写入成功");
           
        }
    });
    res.json({
        "shopcarnum": usersarr[index].shopcar.length
    })
    //  console.log(usersarr[index]);
})



app.post("/changenum",function(req,res){
    var index=usersarr.findIndex(function(e){
        return e.username==req.cookies.username;
     })
     var goodindex =usersarr[index].shopcar.findIndex(function (e) { 
         console.log(e); 
        return e.content == req.body.good ;
     })
     usersarr[index].shopcar[goodindex].num =req.body.num;
     fs.writeFile("www/json/user.json",JSON.stringify(usersarr),function(err){
        if(err){
            console.log("写入失败");
            
        }else{
            console.log("写入成功");
           
        }
    });
    res.json(usersarr[index].shopcar);
})

app.post("/del",function(req,res){
    var index=usersarr.findIndex(function(e){
        return e.username==req.cookies.username;
     })
     console.log(req.body.good);
     var goodindex =usersarr[index].shopcar.findIndex(function (e) { 
        // console.log(e); 
       return e.content == req.body.good ;
    })
    console.log(goodindex);
    if(goodindex > -1){
        usersarr[index].shopcar.splice(goodindex,1); 
    }
    fs.writeFile("www/json/user.json",JSON.stringify(usersarr),function(err){
        if(err){
            console.log("写入失败");
            
        }else{
            console.log("写入成功");
           
        }
    });
    res.json(usersarr[index].shopcar);
})

fs.readFile("www/json/user.json",function(err,data){
    if(!err){
        // console.log(data.toString());
        usersarr=JSON.parse(data);
        // console.log(usersarr);
    }else{
        // console.log(err);
    }
   
})
app.listen(3000,function(){
    console.log("服务器开启中....")
});
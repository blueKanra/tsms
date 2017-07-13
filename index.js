var express = require('express');
var app = express();

var timestamp = require('unix-timestamp');
var requestLanguage = require('express-request-language');
var useragent = require('express-useragent');
var cookieParser = require('cookie-parser');

var fs = require('fs');

app.use(cookieParser());
app.use(requestLanguage({
  languages: ['en-US', 'zh-CN'],
  cookie: {
    name: 'language',
    options: { maxAge: 24*3600*1000 },
    url: '/languages/{language}'
  }
}));
app.use(useragent.express());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/:str', function(request, response) {
  //test
  var str = request.params.str.split('%20').join(' ');
  var date = new Date(str);
  if(date!="Invalid Date"){
    response.json({
      "natural date":date.toDateString(),
      "unix":timestamp.fromDate(date)
    })
  }else if(!isNaN(str)){
    date = new Date(parseInt(str)*1000);
    response.json({
      "natural date":date.toDateString(),
      "unix":timestamp.fromDate(date)
    })
  }else{
    response.json({
      "natural date":"invalid string",
      "unix":"invalid string"
    })
  }
});

app.get('/getHead/:str', function(request, response) {
  console.log(request.connection);
  response.json({
    "ipaddress":request.connection,
    "os":request.useragent['os'],
    "language":request.language
  })
});

app.get('/shrtnr/:str', function(request, response) {
  var shrtJSON = require('./jsondb/shortener.json')

  if(shrtJSON[request.params.str]!=undefined){
    console.log(Object.keys(shrtJSON)[request.params.str]);
    response.redirect("https://www." + request.params.str);
  }else{
    if(Object.keys(shrtJSON)[request.params.str]!=undefined){
      response.redirect("https://www." + Object.keys(shrtJSON)[request.params.str]);
    }else{
      console.log("Formatting");
      var x = request.params.str.split(".")
      var str = "";

      if(x[1]=="com"||
        x[1]=="co"||
        x[1]=="uk"||
        x[1]=="fr"||
        x[1]=="gov"||
        x[1]=="hk"||
        x[1]=="net"||
        x[1]=="org"||
        x[1]=="ca"){

          shrtJSON[request.params.str] = Object.keys(shrtJSON).length;
          fs.writeFile('./jsondb/shortener.json', JSON.stringify(shrtJSON), function(){
            response.json({
              "og":request.params.str,
              "shrt":"https://enigmatic-stream-32553.herokuapp.com/shrter/" + shrtJSON[request.params.str]
            });
            response.end();
          })
        }else{
          console.log("not formatted as 'website.com/whatever'");
          response.send("please format as 'website.com/whatever'");
        }
    }
  }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

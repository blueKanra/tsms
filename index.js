var express = require('express');
var app = express();
var timestamp = require('unix-timestamp');

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

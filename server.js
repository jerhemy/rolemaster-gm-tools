var express = require('express');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser')
var http = require("http");
var Roll = require('roll'),
    roll = new Roll();
var Encounters = require('./controllers/encounter');

var port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/api/tables', function(req, res) {
  
  var tables = [];
  
  fs.readdir('tables', function(err, files) {
      if (err) return;
      
      files.forEach(function(f) {
          var name = f.replace('.json', '');
          tables.push(name);
      });
      
      res.send(tables);
  });
  
});

app.get('/api/tables/treasures', function(req, res) {
  
  var tables = [];
  
  fs.readdir('treasures', function(err, files) {
      if (err) return;
      
      files.forEach(function(f) {
          var name = f.replace('.json', '');
          tables.push(name);
      });
      
      res.send(tables);
  });
  
});

app.get('/api/dice/:number', function(req, res) {
  var num = req.params.number;
  var oneDie = roll.roll(num);
  res.send(oneDie);
});

app.get('/api/tables/:name', function(req, res) {
  var name = req.params.name;
  if(name) {
    fs.readFile('tables/' + name + '.json', 'utf8', function(err, data){
      if(err) { console.log(err); return; }
        if(data) {
          var json = "";
          try {
            json = JSON.parse(data.trim());
            res.send(json);
          } catch (e) {
            console.log(e);
            res.send();
          }
        } else {
          res.end();
        }
        
        
    });
  }
});

app.get('/api/table/treasure/:name', function(req, res) {
  var name = req.params.name;
  if(name) {
    fs.readFile('treasures/' + name + '.json', 'utf8', function(err, data){
      if(err) { console.log(err); return; }
        if(data) {
          var json = "";
          try {
            json = JSON.parse(data.trim());
            res.send(json);
          } catch (e) {
            console.log(e);
            res.send();
          }
        } else {
          res.end();
        }
        
        
    });
  }
});

app.get('/api/creature/:name', function(req, res) {
  var name = req.params.name;
  if(name) {
    fs.readFile('creatures/' + name + '.json', 'utf8', function(err, data){
      if(err) { console.log(err); return; }
        if(data) {
          var json = "";
          try {
            json = JSON.parse(data.trim());
            res.send(json);
          } catch (e) {
            res.send(data.trim());
          }
        } else {
          res.end();
        }
        
        
    });
  }
});


app.get('/api', Encounters);

var server = app.listen(port, function () {
  var host = process.env.IP
  var port = process.env.PORT;

  console.log('Example app listening at http://%s:%s', host, port);
});
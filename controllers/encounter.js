var express = require('express');
var Roll = require('roll'),
    roll = new Roll();
var MongoClient = require('mongodb').MongoClient;


module.exports = (function() {
    'use strict';
    var mongoUrl = 'mongodb://localhost:27017/Rolemaster';
    var api = express.Router();

    api.get('/encounter/:table', function(req, res) {
        var tableName = req.params.table;
        
        function rollEncounter(table) {
            var dice = roll.roll('1d100').result;    
            return table.data.filter(function(item){
                if(dice >= item.min && dice <= item.max) {
                    return item;
                }
            })[0];            
        };
        
        function splitTable(tables) {
            var dice = roll.roll('1d100').result;
            console.log(dice);
            var index = dice >= 51 ? 1 : 0;
            return tables[index];
        };
        
        
        MongoClient.connect(mongoUrl, function(err, db) {
            // Use the admin database for the operation
            if(err) return;
            var collection = db.collection('Encounter');
          
            collection.find( { "name": { $regex: '^' + tableName } } ).toArray(function(err, creatures){
                if(err) return;
                console.log('Tables Found:' + creatures.length);
                
                if(creatures.length > 1) {
                    rollEncounter(splitTable(creatures));
                } else {
                    rollEncounter(creatures);
                }

                db.close();
            })
        });
    });

    
    return api;
})();
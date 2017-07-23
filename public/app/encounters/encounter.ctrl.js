(function(){
    angular.module('RolemasterApp')
    .controller('EncounterCtrl', function($scope, $rootScope, $http, $mdDialog, $log) {
        var TEXT        = "text",
            GROUP       = "group",
            TABLE       = "table",
            SPECIAL     = "reroll";

        var splitTables = [
            "Rough & Rugged Hills",
            "Ruins",
            "Enchanted Areas",
            "Freshwater Coasts",
            "Lakes & Rivers",
            "Plains & Grasslands",
            "Saltwater Shores",
            "Heath & Scrublands",
            "Decid./Mixed Forest",
            "Coniferous Forest"
        ]

        $scope.tables = {
            creatures: [],
            encounters: [],
            groups: []
        }

        $scope.data = {
            tables: {},
            loaded: 0,
            total: 0,
            rolls: [],
            creatures: []
        }

        $scope.simulateQuery = false;
        $scope.isDisabled    = false;
        $scope.selectedItem  = null;
        $scope.searchText    = "";
        $scope.querySearch   = querySearch;
        $scope.selectedItemChange = selectedItemChange;
        $scope.searchTextChange   = searchTextChange;


        function searchTextChange(text) {
            $log.info('Text changed to ' + text);
        }

        function selectedItemChange(item) {
            if(item) {
                $log.info('Item changed to ' + JSON.stringify(item));
                $scope.data.creatures.push(item);
                $scope.searchText = '';
                $scope.selectedItem = undefined;
            }
        }

        function querySearch (query) {
            var results = query ? $scope.tables.creatures.filter( createFilterFor(query) ) : $scope.tables.creatures;
            return results;
        }

        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);

          return function filterFn(creature) {
            return (creature.name.toLowerCase().indexOf(lowercaseQuery) === 0);
          };

        }

        function getDiceRolls(addRolls) {
            var addRolls = addRolls || false;
            $http.get('/api/dice/100d100').then(function(response){
                var rolls = response.data.rolled;
                if(!addRolls) {
                    $scope.data.rolls = rolls;
                } else {
                    $scope.data.rolls = $scope.data.rolls.concat(rolls);
                }
            });
        }

        function getDiceRoll() {
            var total = 0;
            var dice = 0;
            var numRolls = 0;
            do {
                dice = $scope.data.rolls.pop();
                total += dice;
                if(dice >= 96) {
                    console.log('Open Ended with ' + dice + ", Rerolling!");
                } else {
                    console.log('Rolled a ' + dice);
                }
                numRolls++
            } while ( (dice > 96 && numRolls < 5));


            if($scope.data.rolls.length < 25) {
               getDiceRolls(true);
            }

           return total;
        };

        function isSplitTable(table) {

            if(splitTables.indexOf(table) > -1) {
                return true;
            }

            return false;
        }

        $scope.rollTable = function(table) {
            //$scope.testCreatures();
            var tableName = table;

            var roll = getDiceRoll();
            $log.info(roll);
            //Check if Split Table
            if(isSplitTable(table)) {
                var splitRoll = getDiceRoll() <= 50 ? " 50" : " 100";

                tableName = table + splitRoll;
                console.log("Rolling on " + tableName);
            }

            if($scope.tables.encounters.hasOwnProperty(tableName)) {
                var record = $scope.tables.encounters[tableName].data.filter(function(item){
                    if(roll >= item.min && roll <= item.max) {
                        return item;
                    }
                });

                console.log("Found " + record[0].name);

                switch(record[0].type) {
                    case GROUP:
                        $scope.showPopup("Please Reroll on a " + record[0].name + " table.");
                        break;
                    case TABLE:
                        $scope.showPopup("Please Reroll on the " + record[0].name + " table.");
                        break;
                    case SPECIAL:
                        $scope.showPopup("Rolled Special or REROLL");
                        break;
                    case TEXT:
                        $scope.showPopup("Rolled " + record[0].name);
                        break;
                    default:
                        //Creature
                        var creatures = "";
                        record.forEach(function(element, index){
                            creatures += record[index].name;
                            //Loading 2 Cards
                            if(record[index].name.indexOf(',') > -1) {
                                var  split = record[index].name.split(',');
                                split.forEach(function(el, idx){
                                    $scope.getCreature(split[idx])
                                })
                            } else {
                                if(!$scope.getCreature(record[index].name)) {
                                    $scope.showPopup("Couldn't load card for: " + record[index].name);
                                }
                            }
                        })

                        break;
                }
            } else {
               $scope.showPopup("Coundn't find table: " + tableName);
            }

        };

        $scope.closeCard = function(index) {
          $scope.data.creatures.splice(index, 1);
        }

        $scope.getCreature = function(name) {
             //Lookup {name} on Creatures Table
            var creatures = $scope.tables.creatures.filter(function(creature){
                if(creature.fullname == name) {
                    return creature;
                }
            });


            if(creatures.length > 0) {
                $scope.data.creatures.push(creatures[0]);
                return true;
            }

            return false;
        };

        $scope.loadCreatures = function(creature) {
            $http.get('/api/creature/Creatures').then(function(data){
                var data = data.data;
                $scope.tables.creatures = data;
            },
            function(data) {
               console.log(data);
            });
        };

        var loadEncounterTables = function() {
            $http({
              method: 'GET',
              url: '/api/tables/'
            }).then(function(response) {
                $scope.data.loaded = $scope.data.total = response.data.length;

                var tablesToLoad = response.data.length;

                angular.forEach(response.data, function(table){
                    $http.get('/api/tables/' + table).then(function(data){
                        var data = data.data;
                        //Prevent non-tables from being added
                        if(data.type == 'table') {
                            $scope.tables.encounters[data.name] = data;
                            --$scope.data.loaded;
                        }
                    },
                    function(data) {

                    });
                });

            }, function(response) {

            });
        }

        $scope.showPopup = function(text) {

            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'dialog1.tmpl.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: false,
                bindToController: true,
                locals: {
                    data: text
                }
            })
            .then(function() {

            }, function() {

            });

          };

        function DialogController($scope, $mdDialog, data) {
            $scope.text = data;
            $scope.hide = function() {
                $mdDialog.hide();
            };
        }

        $scope.testCreatures = function() {
            var missing = [];
            for(var t in $scope.tables.encounters) {
                $scope.tables.encounters[t].data.forEach(function(item){
                    if(!item.type) {
                        var found = false;
                        $scope.tables.creatures.filter(function(creature){
                            if(item.name.indexOf(',') > -1) {
                                var  split = item.name.split(',');
                                split.forEach(function(el, idx) {
                                    if(split[idx] == creature.fullname) {
                                        found = true;
                                    }
                                })
                            } else {
                                if(creature.fullname == item.name) {
                                    found = true;
                                }
                            }
                        });

                        if(!found) {
                            missing.push(item.name + " - " + t)
                        }
                    }
                })
            }

            missing = uniq(missing);
            console.log(JSON.stringify(missing, null, "\t"));
            console.log("Missing Creatures: " + missing.length);
        };


        function uniq(a) {
            var seen = {};
            return a.filter(function(item) {
                return seen.hasOwnProperty(item) ? false : (seen[item] = true);
            });
        }

        getDiceRolls(false);
        $scope.loadCreatures();
        loadEncounterTables();
    })
})();
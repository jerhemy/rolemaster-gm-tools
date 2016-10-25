/* global angular */
(function(){
    'use strict';
    
    angular.module('RolemasterApp', [
        'ngMaterial',
        'ui.router'
    ])
    .config(function($stateProvider, $urlRouterProvider) {
      //
      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise("Encounters");
      //
      // Now set up the states
      $stateProvider
        .state('Encounter', {
          url: "/Encounters",
          controller: 'EncounterCtrl',
          templateUrl: "/app/encounters/encounter.html"
        })
        .state('Treasure', {
          url: "/Treasures",
          controller: 'TreasureCtrl',
          templateUrl: "/app/treasures/treasure.html"
        })
        .state('Dice', {
          url: "/Dice",
          controller: 'DiceCtrl',
          templateUrl: "/app/dice/dice.html"
        })
        .state('Map', {
          url: "/Map",
          controller: 'MapCtrl',
          templateUrl: "/app/maps/maps.html"
        })
        .state('Herb', {
          url: "/Herbs",
          controller: 'HerbCtrl',
          templateUrl: "/app/herbs/herbs.html"
        })
    })
    .controller('MainCtrl', function($scope, $rootScope, $http, $state, $mdDialog) {
        
        $scope.goTo = function(page) {
            $state.go(page);
        }
          
    })
    .filter('orderObjectBy', function() {
        return function(items, field, reverse) {
            var filtered = [];
            angular.forEach(items, function(item) {
            filtered.push(item);
        });
        
        filtered.sort(function (a, b) {
          return (a[field] > b[field] ? 1 : -1);
        });
        
        if(reverse) filtered.reverse();
        
        return filtered;
      };
    })
    .directive("drawing", function(){
        return {
            restrict: "A",
            scope: {
              ngModel: '=ngModel'
            },
            link: function(scope, element, attr, ctrl){
                
                scope.$watch("ngModel", function(newValue, oldValue) {
                  //console.log('rendering', newValue);
                  render();
                });
                
                var ctx = element[0].getContext('2d');
                /*var currentX, currentY;
                var PIXEL_RATIO = (function (ctx) {
                        var dpr = window.devicePixelRatio || 1,
                        bsr = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1;
                
                    return dpr / bsr;
                })(ctx);

                var ratio;
                
                if (!ratio) { ratio = PIXEL_RATIO; } element[0].width =  element[0].width * ratio;
                element[0].height =  element[0].height * ratio;
                element[0].style.width = element[0].width + "px";
                element[0].style.height = element[0].height + "px";
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);*/
                
                element[0].width=760;//horizontal resolution (?) - increase for better looking text
                element[0].height=525;//vertical resolution (?) - increase for better looking text
                element[0].style.width=760;//actual width of canvas
                element[0].style.height=525;//actual height of canvas

                function render() {
                  
                    var model = scope.ngModel;
                    ctx.clearRect(0, 0, element[0].width, element[0].height);
                    ctx.fillStyle="#FFFFFF";
                    ctx.fillRect(0, 0, element[0].width, element[0].height);
                    ctx.font="Bold 12px Georgia";
                    
                    ctx.fillStyle="#000000";
                    ctx.fillText("Name:", 5, 15);
                    ctx.fillText("Sub-Type:", 250, 15);
                    ctx.fillText("Outlook:", 400, 15);
                    ctx.fillText("Intelligence:", 525, 15);
                    ctx.fillText("Notes:",5,35);
                    
                    ctx.fillText("Level:", 5, 95);
                    ctx.fillText("Hits:", 5, 115);
                    ctx.fillText("AT(DB):", 5, 135);
                    ctx.fillText("Size/Crit:",5, 155);
                    ctx.fillText("Base Rate:",5,175);
                    ctx.fillText("Max Pace:",5, 195);
                    ctx.fillText("MN Bonus:",5,215);
                    ctx.fillText("MS/AQ:",5,235);
                    ctx.fillText("# Encountered:", 5, 255);
                    ctx.fillText("Treasure:", 5, 275);
                    ctx.fillText("Description:", 5, 295);
                    
                    var attackCount = model.attacks.length;
                    var yAxis = 95,
                        yInc = 20;
                        
                    for(var x = 0; x < attackCount; x++) {
                        ctx.font="Bold 12px Georgia";
                        ctx.fillText("Attack #" + (x+1), 250, yAxis);
                        ctx.font="12px Georgia";
                        ctx.fillText(model.attacks[x], 325, yAxis);
                        yAxis += yInc;
                    }
                    
                    
                    
                    ctx.font="12px Georgia";
                    ctx.fillText(model.name, 50, 15);
                    ctx.fillText(model.subtype, 320, 15);
                    ctx.fillText(model.outlook, 460, 15);
                    ctx.fillText(model.intelligence, 615, 15);
                    
                    ctx.fillText(model.level, 75, 95);
                    ctx.fillText(model.hits, 75, 115);
                    ctx.fillText(model.at_db, 75, 135);
                    ctx.fillText(model.size_crit, 75, 155);
                    ctx.fillText(model.base_rate, 75, 175);
                    ctx.fillText(model.max_pace, 75, 195);
                    ctx.fillText(model.mn_bonus, 75, 215);
                    ctx.fillText(model.ms_aq, 75, 235);
                    ctx.fillText(model.encountered, 110, 255);
                    ctx.fillText(model.treasure, 75, 275);
                    
                    wrapText(ctx, model.notes, 50, 35, 600, 12);
                    wrapText(ctx, model.description, 5, 315, 750, 12);
                };
                
                function drawData() {
                    
                }
                
                function wrapText(context, text, x, y, maxWidth, lineHeight) {
                    var words = text.split(' ');
                    var line = '';
            
                    for(var n = 0; n < words.length; n++) {
                      var testLine = line + words[n] + ' ';
                      var metrics = context.measureText(testLine);
                      var testWidth = metrics.width;
                      if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                      }
                      else {
                        line = testLine;
                      }
                    }
                    context.fillText(line, x, y);
                }
                
                render();
            }
        };
    })
    .filter('keyboardShortcut', function($window) {
        return function(str) {
          if (!str) return;
          var keys = str.split('-');
          var isOSX = /Mac OS X/.test($window.navigator.userAgent);
          var seperator = (!isOSX || keys.length > 2) ? '+' : '';
          var abbreviations = {
            M: isOSX ? '⌘' : 'Ctrl',
            A: isOSX ? 'Option' : 'Alt',
            S: 'Shift'
          };
          return keys.map(function(key, index) {
            var last = index == keys.length - 1;
            return last ? key : abbreviations[key];
          }).join(seperator);
        };
    })
    .service('Creatures', function(){
        var creatures = {};
        
        creatures.list = [];
        
        creatures.add = function(creature) {
            creatures.list.push(creature);
        };
        
        creatures.remove = function(index) {
            
        };
        
        return creatures;
    })
;})()
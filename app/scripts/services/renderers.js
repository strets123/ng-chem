'use strict';

/**
 * @ngdoc service
 * @name ngChemApp.renderers
 * @description
 * # renderers
 * Factory in the ngChemApp.
 */
angular.module('ngChemApp')
  .factory('renderers', function ($timeout) {
    // Service logic
    // ...
    function strip_tags(input, allowed) {
                var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                  commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
              
                // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
                allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
              
                return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
                  return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
                });
    };

    function renderFilter(warningsFilter, fieldKey, title){
              var className = "lightgrey";
            if(warningsFilter == fieldKey){
              className = "blue";
            }
            return '<a class="btn btn-sm btn-default" title="' + title + '" onclick="angular.element(this).scope().cbh.toggleWarningsFilter(&quot;' + fieldKey + '&quot;)" ><span class="glyphicon glyphicon-filter ' + className + ' " ></span></a>';
    }

    function getRenderers(sco){
        var scope;
        
        
        var renderers = {


              
               safeHtmlRenderer : function(instance, td, row, col, prop, value, cellProperties) {
                var escaped = Handsontable.helper.stringify(value);
                escaped = strip_tags(escaped, '<em><b><strong><a><big>'); //be sure you only allow certain HTML tags to avoid XSS threats (you should also remove unwanted HTML attributes)
                td.innerHTML = escaped;
              
                return td;
              },

              modalLinkRenderer : function(instance, td, row, col, prop, value, cellProperties) {
                if(value==null){
                  return td;
                }
                var escaped = Handsontable.helper.stringify(value);
                escaped = strip_tags(escaped, ''); //be sure you only allow certain HTML tags to avoid XSS threats (you should also remove unwanted HTML attributes)
                var a = document.createElement('a');
                a.innerHTML = escaped;
                Handsontable.Dom.addEvent(a, 'mousedown', function (e){
                    // e.preventDefault(); // prevent selection quirk
                    var mol = instance.getSourceDataAtRow(row);
                    scope.cbh.openSingleMol(mol);
                });
                Handsontable.Dom.empty(td);
                td.className  += "htCenter htMiddle courier";
                td.appendChild(a);
              
                return td;
              },
               projectRenderer: function(instance, td, row, col, prop, value, cellProperties){
                var mol = instance.getSourceDataAtRow(row);
                //we have a list of projects - find the right one and render the name

                  //angular.forEach(scope.compounds, function(comp){
                    var split = mol.project.split("/");
                    var projid = split[split.length-1]; 
                    
                    
                    
                  //});

                  var projects = scope.cbh.projects.objects;

                  angular.forEach(projects,function(myproj){

                    
                    if(myproj.id == projid){
                      Handsontable.Dom.empty(td);
                      td.innerHTML = myproj.name;
                      td.className  += "htCenter htMiddle";
                      return td
                    }
                      
                  });

              },
  
               linkRenderer : function(instance, td, row, col, prop, value, cellProperties) {
               var escaped = Handsontable.helper.stringify(value);
                escaped = strip_tags(escaped, '');
                if (escaped.indexOf("http") == 0 && escaped.indexOf("//") > 0){

                  var a = document.createElement('a');
                  var afterHttp = escaped.split("//")[1];
                  a.innerHTML = afterHttp;
                  if (afterHttp.length>30){
                      a.innerHTML = afterHttp.substring(0,29) +"...";
                  }
                  a.href = escaped;
                  a.target = "_blank";
                  Handsontable.Dom.empty(td);
                  td.className  += "htCenter htMiddle ";
                  td.appendChild(a);
                }else{
                  td.className  += " htMiddle ";
                  if(prop == "standardInchiKey"){
                    td.innerHTML = escaped.substring(0,10) +"...";
                    cellProperties.readOnly = true;
                  }else{
                     td.innerHTML = escaped;
                  }
                }
                
                return td;
              },
  
              bulletRenderer:  function(instance, td, row, col, prop, value, cellProperties) {
                var classN = "glyphicon glyphicon-unchecked";
                
                if(value=="true"){
                  classN = "glyphicon glyphicon-check";
                }
                td.className = "htCenter htMiddle htDimmed";
                td.innerHTML = "<h2 class='blue'><span class='"+ classN + "'></span></h2>";
                 cellProperties.readOnly = true;
                return td
              },

               coverRenderer : function(instance, td, row, col, prop, value, cellProperties) {
                if(value==null){
                  return td;
                }
                var escaped = Handsontable.helper.stringify(value),
                  img;
                  img = document.createElement('IMG');
                  //if(value != "") {
                    img.src = value;
                    img.style.cursor = "pointer";
                  //}
                  //img.src = value;
              
                  Handsontable.Dom.addEvent(img, 'mousedown', function (e){
                    // e.preventDefault(); // prevent selection quirk
                    var mol = instance.getSourceDataAtRow(row);
                    scope.cbh.openSingleMol(mol);
                  });
              
                  Handsontable.Dom.empty(td);
                  td.className  += "htCenter htMiddle ";

                  td.appendChild(img);
                
                return td;
              }};
        scope = sco;
        return renderers;
      }
    

    // Public API here
    var data = {
      getColumnLabel : function(c, scope){
        if(c.noSort){
            return "<label>"+ c.knownBy + "</label>";
        }
        var warningFilterHTML = "";
        if(c.warningsFilter){
          warningFilterHTML = renderFilter(scope.warningsFilter, c.data, "");
        }

        //Return a piece of html including an onclick event that
        //will pass to the appropriate function that mujst be implemented in the above controller
        var className = "glyphicon glyphicon-sort";
        var greySort = "lightgrey";
        angular.forEach(scope.sorts, function(item){
          if(angular.isDefined(item[c.data])){
            //If an item is in the sorted columns list
              if(item[c.data].order == "asc"){
                className += '-by-alphabet';
                greySort = "blue";
              }else{
                className += '-by-alphabet-alt';
                greySort = "blue";
              }
          };

        });
        var html = "<label>" + warningFilterHTML + c.knownBy + 
        " <a class='btn btn-sm btn-default " + 
        greySort + "' onclick='angular.element(this).scope().cbh.addSort(\"" 
         + c.data + "\")'><span class='"
          + className + "'></span></a></label>";
        if(angular.isDefined(c.extra)){
          html += c.extra;
        }
        return html
        
      },
      renderFilterLink : function(warningsFilter, fieldKey, title){
        return renderFilter(warningsFilter, fieldKey, title);
      },
      renderHandsOnTable : function(scope, hotObj, element ){
         var rend = getRenderers(scope);
  
        angular.forEach(hotObj.columns, function(c){
          if(angular.isDefined(c.renderer)){

            c.renderer = rend[c.renderer];
          }
        });


        var container1,
            hot1;
        var container = document.createElement('DIV');

        // container.style.overflow = 'hidden';
        // container.style.width = '100%';
        while (element[0].firstChild) {
            element[0].removeChild(element[0].firstChild);
        }
       
        element[0].appendChild(container);
        var hot1 = new Handsontable(container, hotObj);
        var id = element[0].firstChild.id;
        scope.hotId = "#" + id;
        var elem = $(scope.hotId);
        elem.doubleScroll();
       
        scope.hot1 = hot1;
        
      }
    };
    return data;

  });

/* Please do not define the directive as following:
 * laiApp.directive('analyticschart',function($http){}); 
 * rather use following syntax:
 * laiApp.directive('rgraph',['$timeout', function ($timeout){}]); 
 *
 * This is important because when we precompile/minify the assets, the parameter names on the function are
 * renamed and may cause "Undefined Variable" issue at run time, The recommended approach is to exclusively define
 * parameters names in the array so they do not get overwritten.
 */
laiApp.directive('rgraph',['$timeout', function ($timeout) {
  return {
    restrict:'A',
    scope:{
      data:'=data',
      currentNode:'=currentNode',
      highlightTreeNode:'&highlightTreeNode',
      setCenterNode:'&'
    },
    link:function (scope, element, attrs) {

      $timeout(function () {
        var rgraph = new $jit.RGraph({
          injectInto:'infovis',

          background:{
            CanvasStyles:{
              strokeStyle:'#555'
            }
          },
          Navigation:{
            enable:true,
            panning:true,
            zooming:10
          },
          Node:{
            color:'#ddeeff',
            overridable:true
          },

          Edge:{
            color:'#C17878',
            lineWidth:1.0
          },
          onCreateLabel:function (domElement, node) {
            if (node.data['type'] === 'case') {
              if (node.name.length > 15) {
                domElement.innerHTML = node.name.substring(0, 15) + '...';
              }
              else {
                domElement.innerHTML = node.name;
              }
            }
            else {
              domElement.innerHTML = node.name;
            }

            domElement.onclick = function () {
              rgraph.onClick(node.id)
              {
                scope.highlightTreeNode({id:node.id, type:node.data['type']});
              }
              ;

              scope.$apply(function () {
                var n = {
                  'id':node.id,
                  'name':node.name,
                  'data':{
                    'type':node.data['type'],
                    'id':node.data['id']
                  }
                };

                if (node.data['type'] === 'source') {
                  n.data['case_id'] = node.data['case_id'];
                }

                angular.copy(n, scope.currentNode);
              });
            };
          },
          onPlaceLabel:function (domElement, node) {
            style = domElement.style;
            style.display = '';
            style.cursor = 'pointer';
            switch (node._depth) {
              case 0:
                style.fontSize = "1.0em";
                style.color = "#ff0000";
                break;
              case 1:
                style.fontSize = "0.8em";
                style.color = "#ffff01";
                break;
              case 2:
                style.fontSize = "0.8em";
                style.color = "#FF6C00";
                break;
              case 3:
                style.fontSize = "0.8em";
                style.color = "#3399ff";
                break;
              case 4:
                style.fontSize = "0.8em";
                style.color = "#66cc33";
                break;
              default:
                style.display = "none";
            }
            var left = parseInt(style.left);
            var w = domElement.offsetWidth;
            style.left = (left - w / 2) + 'px';
          },
          Tips:{
            enable:true,
            type:'Native',
            offsetX:10,
            offsetY:10,
            onShow:function (tip, node) {
              $(tip).css({'max-width':'300px', 'width':'auto', 'background-color':'#ccc'});
              if (node.data.tooltip) {
                tip.innerHTML = node.data.tooltip;
              } else {
                tip.innerHTML = node.name;
              }
            }
          },
          onBeforePlotNode:function (node) {
            if (node.data.type == 'judge') {
              node.setData('type', 'star');
              node.setData('dim', '8');
            } else if (node.data.type == 'filter') {
              node.setData('type', 'square');
              node.setData('dim', '4');
            } else if (node.data.type == 'case') {
              node.setData('type', 'circle');
              node.setData('dim', '4');
            } else if (node.data.type == 'source') {
              node.setData('type', 'square');
              node.setData('dim', '4');
            }
          }
        });

        scope.$watch('data', onChange, true);


        function onChange(newValue, oldValue, scope) {
          rgraph.loadJSON(scope.data);
          rgraph.refresh();

        }

        //Center the tree node on graph when user click  on tree node display on analysis tab
        scope.centerNode = function (id) {
          if (id) {
            if (rgraph.graph.getNode(id)) {
              rgraph.onClick(id, {
                onComplete:function () {

                }
              });
            }
          }
        }

        //Create the reference of method to be called my controller
        scope.setCenterNode({theDirectiveFn:scope.centerNode});
      }, 0);
    }
  };
}]);

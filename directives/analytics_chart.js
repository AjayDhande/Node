/* Please do not define the directive as following:
 * laiApp.directive('analyticschart',function($http){}); 
 * rather use following syntax:
 * laiApp.directive('analyticschart',['$http', function ($http){}]); 
 *
 * This is important because when we precompile/minify the assets, the parameter names on the function are
 * renamed and may cause "Undefined Variable" issue at run time, The recommended approach is to exclusively define
 * parameters names in the array so they do not get overwritten.
 */
laiApp.directive('analyticschart',['$http', function ($http)
{
  return {
    restrict:'A',
    scope:{
      data:"=data",
      outcomeByCategory:"=outcomeByCategory",
      casesByOutcomes:"=casesByOutcomes",
      verdictsByAttribute:'=verdictsByAttribute'
    },
    link:function (scope, element, attrs) {
      // set fusion charts to html rendered rather than flash.
      FusionCharts.setCurrentRenderer('javascript');

      var fcaseOutcomeschart = $("#ByCaseChart");

      scope.$watch('data', onChange, true);

      function onChange(newValue, oldValue, scope) {
        if (scope.data != null && !jQuery.isEmptyObject(scope.data)) {
          fcaseOutcomeschart.insertFusionCharts({
            swfUrl:"fusionCharts/Pie2D.swf",
            dataSource:scope.data,
            dataFormat:"json",
            width:"320",
            height:"300"
          });
        }
      }


      scope.$watch('outcomeByCategory', onChangeValue, true)

      var fOutcomesByCategoryChart = $("#ByCategoryChart");

      function onChangeValue(newValue, oldValue, scope) {
        if (scope.outcomeByCategory != null && !jQuery.isEmptyObject(scope.outcomeByCategory)) {
          fOutcomesByCategoryChart.insertFusionCharts({
            swfUrl:"fusionCharts/Pie2D.swf",
            dataSource:scope.outcomeByCategory,
            dataFormat:"json",
            width:"350",
            height:"300"
          });
        }
      }

      var fPendingCasesChart = $("#CasesByOutcomes");

      scope.$watch('casesByOutcomes', onCasesValueChanged, true)

      function onCasesValueChanged(newValue, oldValue, scope) {
        if (scope.casesByOutcomes != null && !jQuery.isEmptyObject(scope.casesByOutcomes)) {
          fPendingCasesChart.insertFusionCharts({
            swfUrl:"fusionCharts/Pie2D.swf",
            dataSource:scope.casesByOutcomes,
            dataFormat:"json",
            width:"300",
            height:"300"
          });
        }
      }

      var fPendingCasesAttributesChart = $("#VerdictsByAttribute");

      scope.$watch('verdictsByAttribute', onVerdictsByAttributeChanged, true)

      function onVerdictsByAttributeChanged(newValue, oldValue, scope) {
        if (scope.verdictsByAttribute != null && !jQuery.isEmptyObject(scope.verdictsByAttribute)) {
          fPendingCasesAttributesChart.insertFusionCharts({
            swfUrl:"fusionCharts/StackedColumn2D.swf",
            dataSource:scope.verdictsByAttribute,
            dataFormat:"json",
            width:"600",
            height:"600"
          });
        }
      }
    }
  };
}]);

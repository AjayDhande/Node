angular.module('laiApp').controller('ChartDetailsCtrl',['$scope', '$http', '$routeParams', '$location', function ($scope, $http, $routeParams, $location) {
  $scope.myCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $(nRow).bind('click', function () {
      var self = this;
      $scope.$apply(function () {
        $scope.someClickHandler(aData);
      });
    });
    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.someClickHandler = function (info) {
    window.open("/#/cases/" + info.case_id + "/edit");
  };

  $scope.overrideOptions = {
  };

  // fix for fusioncharts tooltips which sometimes remain from the prior selected chart
  $("#fusioncharts-tooltip-element").hide();

  // need to parse URL because there is an issue with angular and array params.  Therefore I passed the array as a string and I need to
  // reassemble it.
  var case_names = new Array();
  if ($routeParams.case_names) case_names = $routeParams.case_names.split("$");
  var case_names_url_param = "";
  for (var i = 0; i < case_names.length; i++) {
    case_names_url_param = case_names_url_param + "&case_names[]=" + case_names[i];
  }
  var saveLocation = $location.url();
  $location.search("case_names", null); // get rid of original string case_names
  var newParams = $location.url().substring($location.url().indexOf("?")) +
      case_names_url_param; // now add it back in better form
  $location.url(saveLocation);

  $http.get('/search.json' + newParams).success(function (data) {
    // we have the results now get it into the format for datatables and remove poid and ctid from showing.
    $scope.totalSources = data.length;
    if (data[0]) {
      var reportColumns = Object.keys(data[0]);
      var columnHeaders = [];
      var columnDefs = [];
      for (var i = 0; i < reportColumns.length; ++i) {
        if (reportColumns[i] != "case_id" && reportColumns[i] != "source_id") {
          var header = new Object();
          header.sTitle = reportColumns[i];
          columnHeaders.push(header);
          var colDef = new Object();
          colDef.mDataProp = reportColumns[i];
          colDef.aTargets = [i];
          columnDefs.push(colDef);
        }
      }
      $scope.columnHeaders = columnHeaders;
      $scope.columnDefs = columnDefs;
      $scope.initDataTable = true;
    }
    $scope.sources = data;
  });
}]);

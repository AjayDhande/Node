angular.module('laiApp').controller('CaseEditCtrl',['$scope', '$http', '$routeParams', '$location','PageService', function ($scope, $http, $routeParams, $location, PageService) {

  $scope.sources = []; // need to initialize for directive to avoid js issue.

  $http.get('/cases/' + $routeParams.caseId + '/edit.json', { tracker:'ajaxCall' }).success(function (data) {
    $scope.case = data;
    $scope.sources = data.sources;
    $scope.caseProfileAttrs = (data.case_profile) ? data.case_profile.category.category_attributes : null;
    $scope.totalSources = data.sources.length;
    PageService.setTitle(data.name);
  });


  // for sources
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
    $location.path("/case/" + $scope.case.id + "/source/" + info.id);
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"attachment_file_name", "aTargets":[1]},
    { "mDataProp":"category_name", "aTargets":[2]},
    { "mDataProp":"created_at", "aTargets":[3],
      "mRender":function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      } }
  ];

  $scope.overrideOptions = {
  };

  $scope.results = function (content, completed) {
    if (completed && content.length > 0) {
      // process results
      var resultObject = JSON.parse(content); // TODOAF fix processing of errors
      if (resultObject.result_code == -1) {
        alert("Error: " + resultObject.description);
      } else {
        $scope.totalSources++;
        $scope.sources.unshift(JSON.parse(content));
      }
    } else {
      // 1. ignore content and adjust your model to show/hide UI snippets; or
      // 2. show content as an _operation progress_ information
    }
  }
}]);
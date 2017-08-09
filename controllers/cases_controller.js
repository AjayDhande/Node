angular.module('laiApp').controller('CasesCtrl',['$scope', '$http', function ($scope, $http) {
  $scope.cases = []; // initialize to avoid js error with directive
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
    window.open("/#/cases/" + info.id + "/edit");
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"name", "aTargets":[1], "sWidth":"60%"},
    { "mDataProp":"practice_area_name", "aTargets":[2], "sWidth":"20%" }
  ];

  $scope.overrideOptions = {
  };

  $http.get('/cases', { tracker:'ajaxCall' }).success(function (data) {
    $scope.cases = data;
    $scope.totalCases = data.length;
  });

}]);
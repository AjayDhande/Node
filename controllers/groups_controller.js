angular.module('laiApp').controller('GroupsCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
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
    $location.path("/groups/" + info.id + "/edit");
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"name", "aTargets":[1]},
    { "mDataProp":"description", "aTargets":[2]},
    { "mDataProp":"created_at", "aTargets":[3],
      "mRender":function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      } }
  ];

  $scope.overrideOptions = {
  };

  // Create an empty data structure for now so that the page will render.
  $scope.groups = [];

  // Comment out until groups have been implemented on the server.
  //$http.get('/groups.json').success(function (data) {
  //  $scope.groups = data;
  //  $scope.totalGroups = data.length;
  //});

  $scope.createNew = function () {
    $location.path("/groups/new");
  };
}]);

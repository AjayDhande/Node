laiApp.controller('RolesCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.roles = [];

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
    $location.path("/roles/" + info.id + "/edit");
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

  $http.get('/roles.json').success(function (data) {
    angular.copy(data, $scope.roles);
  });

  $scope.createNew = function () {
    $location.path("/roles/new");
  };
}]);

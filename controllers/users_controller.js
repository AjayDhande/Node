laiApp.controller('UsersCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.users = [];

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
    $location.path("/users/" + info.id + "/edit");
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"username", "aTargets":[1]},
    { "mDataProp":"full_name", "aTargets":[2]},
    { "mDataProp":"email", "aTargets":[3] },
    { "mDataProp":"firm_location_name", "aTargets":[4] },
    { "mDataProp":"enabled", "aTargets":[5] },
    { "mDataProp":"created_at", "aTargets":[6],
      "mRender":function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      } }
  ];

  $scope.overrideOptions = {
  };

  $http.get('/users.json').success(function (data) {
    angular.copy(data, $scope.users);
  });

  $scope.createNew = function () {
    $location.path("/users/new");
  };
}]);

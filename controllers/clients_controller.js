laiApp.controller('ClientsCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.editClient = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $(nRow).bind('click', function () {
      var self = this;
      $scope.$apply(function () {
        $scope.editClientHandler(aData);
      });
    });

    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.editClientHandler = function (info) {
    $location.path("/clients/" + info.id + "/edit");
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"name", "aTargets":[1]},
    { "mDataProp":"description", "aTargets":[2]},
    { "mDataProp":"updated_at", "aTargets":[3],
      "mRender":function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      }
    }
  ];

  $scope.overrideOptions = {
  };

  $scope.clients = [];

  $http.get('/clients.json').success(function (data) {
    angular.copy(data, $scope.clients);
  });

  $scope.createNew = function () {
    $location.path("/clients/new");
  };
}]);

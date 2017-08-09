laiApp.controller('SaveSearchDialogCtrl', ['$scope', '$modalInstance', 'userSearch', function SaveSearchDialogCtrl($scope, $modalInstance, userSearch) {
  $scope.user_search = userSearch;

  $scope.ok = function () {
    $modalInstance.close($scope.user_search);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

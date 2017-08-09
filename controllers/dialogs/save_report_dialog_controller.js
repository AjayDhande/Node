laiApp.controller('SaveReportDialogCtrl', ['$scope', '$modalInstance', 'report', 'formats', function SaveReportDialogCtrl($scope, $modalInstance, report, formats) {
  $scope.report = report;
  $scope.formats = formats;

  $scope.ok = function () {
    $modalInstance.close($scope.report);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

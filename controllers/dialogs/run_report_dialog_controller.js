laiApp.controller('RunReportDialogCtrl', ['$scope', '$modalInstance', '$http', '$rootScope', 'AuthenticationService', 'report', 'formats', function RunReportDialogCtrl($scope, $modalInstance, $http, $rootScope, AuthenticationService, report, formats) {
  $scope.report = report;
  $scope.formats = formats;
  $scope.dialog = {
    'download_url': null,
    'show_error': false,
    'error_list': [],
    'show_success': false
  };

  $scope.ok = function () {
    // Reset the dialog attributes to remove them from the UI to
    // prevent the user from seeing an old status.
    $scope.dialog.download_url = null;
    $scope.dialog.show_success = false;
    $scope.dialog.error_list = [];
    $scope.dialog.show_error = false;

    $scope.runReport($scope.report);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.runReport = function (report) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.post('users/' + currentUser.id + '/reports/execute.json', report).success(function (data) {
        $scope.dialog.download_url = data.url;
        $scope.dialog.show_success = true;
      }).error(function (data, status, headers, config) {
        if (status == 400) {
          // display validation errors
          $scope.dialog.error_list = data.errors;
        } else {
          $scope.dialog.error_list = {"500": "An unknown error occurred."};
        }
        $scope.dialog.show_error = true;
      });
    });
  };
}]);

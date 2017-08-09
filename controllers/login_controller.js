angular.module('laiApp').controller('LoginCtrl',['$scope', '$http', '$window', 'AuthenticationService', function ($scope, $http, $window, AuthenticationService) {
  $scope.user = {
    'username':null,
    'password':null,
    'rememberMe':false
  };

  $scope.login = function (user) {
    $scope.errorMessage = null;
    AuthenticationService.login(user.username, user.password, user.rememberMe, function (user) {
      $window.location.href = '/';
    }, function (errorMessage) {
      $scope.errorMessage = errorMessage;
    });
  };
}]);

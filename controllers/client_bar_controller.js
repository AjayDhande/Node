laiApp.controller('ClientBarCtrl',['$scope', '$http', '$window', '$rootScope', 'AuthenticationService', function ($scope, $http, $window, $rootScope, AuthenticationService) {
  $scope.selectedClient = {};
  $scope.clients = [];
  $scope.user = {};

  $scope.$on('handleUpdateClient', function (event, args) {
    $scope.updateClient({'id':args.client_id});
  });

  AuthenticationService.getCurrentUser().then(function (currentUser) {
    angular.copy(currentUser, $scope.user);
    $http.get('users/' + $scope.user.id + '/clients.json').success(function (clients) {
      angular.copy(clients, $scope.clients);
      angular.copy($scope.getSelectedClient($scope.user.current_client_id), $scope.selectedClient);
    });
  });

  $scope.updateClient = function (client) {
    $scope.user.current_client_id = client.id;
    $http.put('users/' + $scope.user.id + '.json', $scope.user).success(function (data) {
      angular.copy($scope.getSelectedClient(client.id), $scope.selectedClient);
      $rootScope.$broadcast('clientUpdated');
    });
  }

  $scope.getSelectedClient = function (current_client_id) {
    return $.grep($scope.clients, function (e) {
      return e.id == current_client_id;
    })[0]; // get selected client object from id.
  }
}]);

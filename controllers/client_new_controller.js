laiApp.controller('ClientNewCtrl',['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
  // Used by the view to show appropriate text for new/edit.
  $scope.newClient = true;
  // A list of all users in the system.
  $scope.users = [];
  // The client being created.
  $scope.client = {
    'name':null,
    'description':null,
    'user_ids':[]
  };

  $http.get('users.json').success(function (data) {
    var users = [];
    for (var i = 0; i < data.length; i++) {
      users.push({id:data[i].id, username:data[i].username, full_name:data[i].full_name, checked:false});
    }

    angular.copy(users, $scope.users);
  });

  $scope.userChecked = function (client, user) {
    if (user.checked) {
      client.user_ids.push(user.id);
    } else {
      var index = client.user_ids.indexOf(user.id);
      client.user_ids.splice(index, 1);
    }
  };

  $scope.saveClient = function () {
    $http.post('clients.json', $scope.client).success(function (data) {
      $location.path("/clients");
      $rootScope.$broadcast('successMessageUpdated', "Client added.");
    });
  };
}]);

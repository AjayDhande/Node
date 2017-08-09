laiApp.controller('ClientEditCtrl',['$scope', '$http', '$location', '$routeParams', '$q', '$rootScope', function ($scope, $http, $location, $routeParams, $q, $rootScope) {
  // Used by the view to show appropriate text for new/edit.
  $scope.newClient = false;
  // A list of all users in the system.
  $scope.users = [];
  // The client being edited.
  $scope.client = {
    'name':null,
    'description':null,
    'user_ids':[]
  };

  var usersPromise = $http.get('users.json');
  var clientPromise = $http.get('clients/' + $routeParams.clientId + '/edit.json');

  $q.all([usersPromise, clientPromise]).then(function (results) {
    var userResults = results[0];
    var users = [];
    for (var i = 0; i < userResults.data.length; i++) {
      var user = userResults.data[i];
      users.push({id:user.id, username:user.username, full_name:user.full_name, checked:false});
    }

    angular.copy(users, $scope.users);

    var clientData = results[1].data;
    var client = {
      'name':clientData.name,
      'description':clientData.description,
      'user_ids':[]
    };

    for (var j = 0; j < clientData.users.length; j++) {
      var id = clientData.users[j].id;
      for (var k = 0; k < $scope.users.length; k++) {
        if ($scope.users[k].id === id) {
          $scope.users[k].checked = true;
          client.user_ids.push(id);
        }
      }
    }

    angular.copy(client, $scope.client);
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
    $http.put('clients/' + $routeParams.clientId + '.json', $scope.client).success(function (data) {
      $location.path("/clients");
      $rootScope.$broadcast('successMessageUpdated', "Client updated.");
    });
  };
}]);

angular.module('laiApp').controller('UserEditCtrl',['$scope', '$http', '$location', '$routeParams', '$q', '$rootScope', function ($scope, $http, $location, $routeParams, $q, $rootScope) {
  // An indicator of whether this controller is responsible for creating a new user.
  $scope.newUser = false;

  // A list of firm locations to associate with the user.
  $scope.firmLocations = [];

  // A list of available roles to associate with the user.
  // {'id': 2, 'name': 'Role #1', 'description': 'Allows users to access feature 1.', 'checked': true}
  $scope.roles = [];

  // The user being edited.
  $scope.user = {};

  $http.get('reference_data.json?type=FirmLocation').success(function (data) {
    angular.copy(data, $scope.firmLocations);
  });

  $http.get('users/' + $routeParams.userId + '/edit.json').success(function (data) {
    angular.copy(data, $scope.user);

    $http.get('roles.json').success(function (data) {
      for (var i = 0; i < data.length; i++) {
        var role = data[i];
        var has_role = $scope.userHasRole($scope.user, role);
        $scope.roles.push({id:role.id, name:role.name, description:role.description, checked:has_role});
      }
    });
  });

  // Determines whether the supplied user has the specified role.
  $scope.userHasRole = function (user, role) {
    for (var i = 0; i < user.roles.length; i++) {
      if (user.roles[i].id === role.id) {
        return true;
      }
    }

    return false;
  };

  $scope.roleClicked = function (user, role) {
    // The role is being added to the user.
    if (role.checked) {
      user.roles.push({'id':role.id, 'name':role.name});
    } else {
      // Remove the role from the user.
      var index = -1;
      for (var i = 0; i < user.roles.length; i++) {
        // Find the index of the role to remove.
        if (user.roles[i].id === role.id) {
          index = i;
          break;
        }
      }

      if (index != -1) {
        // Remove the role at the specified index.
        user.roles.splice(index, 1);
      }
    }
  };

  $scope.saveUser = function () {
    $http.put('users/' + $routeParams.userId + '.json', $scope.user).
        success(function (data) {
          $location.path("/users");
          $rootScope.$broadcast('successMessageUpdated', "User updated.");
        });
  };
}]);

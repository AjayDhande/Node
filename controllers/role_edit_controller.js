angular.module('laiApp').controller('RoleEditCtrl',['$scope', '$http', '$location', '$routeParams', '$q', '$rootScope', function ($scope, $http, $location, $routeParams, $q, $rootScope) {
  $scope.newRole = false;

  var permissionsPromise = $http.get('permissions.json').success(function (data) {
    $scope.permissions = [];
    for (var i = 0; i < data.length; i++) {
      $scope.permissions.push({id:data[i].id, name:data[i].name, description:data[i].description, checked:false});
    }
  });

  var usersPromise = $http.get('users.json').success(function (data) {
    $scope.users = [];
    for (var i = 0; i < data.length; i++) {
      $scope.users.push({id:data[i].id, username:data[i].username, full_name:data[i].full_name, checked:false});
    }
  });

  var rolePromise = $http.get('roles/' + $routeParams.roleId + '/edit.json').success(function (data) {
    $scope.role = {
      'name':data.name,
      'description':data.description
    };

    $scope.role_permissions = data.permissions;
    $scope.role_users = data.users;
  });

  $q.all([permissionsPromise, usersPromise, rolePromise]).then(function (results) {
    for (var i = 0; i < $scope.role_permissions.length; i++) {
      var id = $scope.role_permissions[i].id;
      for (var j = 0; j < $scope.permissions.length; j++) {
        if ($scope.permissions[j].id === id) {
          $scope.permissions[j].checked = true;
        }
      }
    }

    for (var i = 0; i < $scope.role_users.length; i++) {
      var id = $scope.role_users[i].id;
      for (var j = 0; j < $scope.users.length; j++) {
        if ($scope.users[j].id === id) {
          $scope.users[j].checked = true;
        }
      }
    }
  });

  $scope.saveRole = function () {
    $scope.role.permission_ids = [];
    angular.forEach($scope.permissions, function (permission) {
      if (permission.checked) {
        $scope.role.permission_ids.push(permission.id);
      }
    });

    $scope.role.user_ids = [];
    angular.forEach($scope.users, function (user) {
      if (user.checked) {
        $scope.role.user_ids.push(user.id);
      }
    });

    $http.put('roles/' + $routeParams.roleId + '.json', $scope.role).
        success(function (data) {
          $location.path("/roles");
          $rootScope.$broadcast('successMessageUpdated', "Role updated.");
        });
  };
}]);

angular.module('laiApp').controller('RoleNewCtrl',['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
  $scope.newRole = true;

  $http.get('permissions.json').success(function (data) {
    $scope.permissions = [];
    for (var i = 0; i < data.length; i++) {
      $scope.permissions.push({id:data[i].id, name:data[i].name, description:data[i].description, checked:false});
    }
  });

  $http.get('users.json').success(function (data) {
    $scope.users = [];
    for (var i = 0; i < data.length; i++) {
      $scope.users.push({id:data[i].id, username:data[i].username, full_name:data[i].full_name, checked:false});
    }
  });

  $scope.role = {};

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

    $http.post('roles.json', $scope.role).success(function (data) {
      $location.path("/roles");
      $rootScope.$broadcast('successMessageUpdated', "Role added.");
    });
  };
}]);

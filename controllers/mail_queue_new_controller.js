laiApp.controller('MailQueueNewCtrl',['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
  // Used by the view to show appropriate text for new/edit.
  $scope.newMailQueue = true;
  // A list of all roles in the system.
  $scope.roles = [];
  // The mail queue being created.
  $scope.mailQueue = {
    'name':null,
    'description':null,
    'email':null,
    'role_ids':[]
  };

  $http.get('roles.json').success(function (data) {
    var roles = [];
    for (var i = 0; i < data.length; i++) {
      roles.push({id:data[i].id, name:data[i].name, description:data[i].description, checked:false});
    }

    angular.copy(roles, $scope.roles);
  });

  $scope.roleChecked = function (mailQueue, role) {
    if (role.checked) {
      mailQueue.role_ids.push(role.id);
    } else {
      var index = mailQueue.role_ids.indexOf(role.id);
      mailQueue.role_ids.splice(index, 1);
    }
  };

  $scope.saveMailQueue = function () {
    $http.post('mail_queues.json', $scope.mailQueue).success(function (data) {
      $location.path("/mail_queues");
      $rootScope.$broadcast('successMessageUpdated', "Queue added.");
    });
  };
}]);

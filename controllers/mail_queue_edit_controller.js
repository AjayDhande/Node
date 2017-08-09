laiApp.controller('MailQueueEditCtrl',['$scope', '$http', '$location', '$routeParams', '$q', '$rootScope', function ($scope, $http, $location, $routeParams, $q, $rootScope) {
  // Used by the view to show appropriate text for new/edit.
  $scope.newMailQueue = false;
  // A list of all roles in the system.
  $scope.roles = [];
  // The mailQueue being edited.
  $scope.mailQueue = {
    'name':null,
    'description':null,
    'email':null,
    'role_ids':[]
  };

  var rolesPromise = $http.get('roles.json');
  var mailQueuePromise = $http.get('mail_queues/' + $routeParams.mailQueueId + '/edit.json');

  $q.all([rolesPromise, mailQueuePromise]).then(function (results) {
    var roleResults = results[0];
    var roles = [];
    for (var i = 0; i < roleResults.data.length; i++) {
      var role = roleResults.data[i];
      roles.push({id:role.id, name:role.name, description:role.description, checked:false});
    }

    angular.copy(roles, $scope.roles);

    var mailQueueData = results[1].data;
    var mailQueue = {
      'name':mailQueueData.name,
      'description':mailQueueData.description,
      'email':mailQueueData.email,
      'role_ids':[]
    };

//      for (var j = 0; j < mailQueueData.roles.length; j++) {
//        var id = mailQueueData.roles[j].id;
//        for (var k = 0; k < $scope.roles.length; k++) {
//          if ($scope.roles[k].id === id) {
//            $scope.roles[k].checked = true;
//            mailQueue.role_ids.push(id);
//          }
//        }
//      }

    angular.copy(mailQueue, $scope.mailQueue);
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
    $http.put('mail_queues/' + $routeParams.mailQueueId + '.json', $scope.mailQueue).success(function (data) {
      $location.path("/mail_queues");
      $rootScope.$broadcast('successMessageUpdated', "Queue updated.");
    });
  };
}]);

// Based on suggestions from Josh David Miller at
// http://stackoverflow.com/questions/14206492/how-do-i-store-a-current-user-context-in-angular/14206567#14206567
laiApp.factory('AuthenticationService', ['$http', '$window', '$q', function ($http, $window, $q) {
  var service = {
    // Holds the details about the current user.
    currentUser: null,

    login: function (username, password, rememberMe, success, failure) {
      $http.post('/users/sign_in.json', {
        "user": {
          "username": username,
          "password": password,
          "remember_me": rememberMe ? 1 : 0
        }
      }).success(function (data) {
          service.currentUser = data;
          success(data);
        }).error(function (data, status) {
          failure('Invalid username and/or password.');
        });
    },
    logout: function () {
      $http.delete('/users/sign_out.json').then(function () {
        service.currentUser = null;
        $window.location.href = '/';
      });
    },
    isAuthenticated: function () {
      return !!service.currentUser;
    },
    getCurrentUser: function () {
      // The current user may be from a previous session or a browser refresh.
      // If the user is not authenticated, then ask the server for the currently
      // authenticated user. The server should respond with a 401 if there is
      // no current user.
      if (service.isAuthenticated()) {
        return $q.when(service.currentUser);
      } else {
        return $http.get('/users/current_auth_user.json').then(function (response) {
          service.currentUser = response.data;
          return service.currentUser;
        });
      }
    },
    updateUser: function () {
      return $http.get('/users/current_auth_user.json').then(function (response) {
        service.currentUser = response.data;
        return service.currentUser;
      });
    },
    isAdmin: function () {
      if (service.isAuthenticated()) {
        for (var i = 0; i < service.currentUser.roles.length; i++) {
          var role = service.currentUser.roles[i];
          if ('Administrators' === role.name) {
            return true;
          }
        }
      }

      return false;
    },
    hasPermission: function (name) {
      if (service.isAuthenticated()) {
        // Check whether the current user is an administrator.
        if (service.isAdmin()) {
          return true;
        }

        for (var i = 0; i < service.currentUser.permissions.length; i++) {
          var permission = service.currentUser.permissions[i];
          if (permission.name === name) {
            return true;
          }
        }
      }

      return false;
    }
  };

  return service;
}]);

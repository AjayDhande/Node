angular.module('laiApp').controller('MainCtrl', ["$scope", "$http", "$route", "$rootScope", "AuthenticationService", "PageService", "promiseTracker", "$window", function ($scope, $http, $route, $rootScope, AuthenticationService, PageService, promiseTracker, $window) {
  $scope.Page = PageService;
  $scope.showError = false;
  $scope.showSuccess = false;
  $scope.showKona = false;

  $scope.ajaxSpinner = promiseTracker('ajaxCall');

  // Main Notification block
  $scope.notifList = [];
  Pusher.log = function (message) {
    if (window.console && window.console.log) window.console.log(message);
  };
  var pusher = new Pusher('e552dbe5006f19fff451');
  var channel = pusher.subscribe('email_channel');
  channel.bind('email_processed', function (data) {
    $scope.$apply(function () {
      if (data.user_id == $scope.currentUser.id) {  // only notify user associated with message
        $scope.notifList.push(data);
      }
    });

  });

  $scope.clearList = function () {
    $scope.notifList = [];
  }

  $scope.currentUser = {};
  AuthenticationService.getCurrentUser().then(function (currentUser) {
    angular.copy(currentUser, $scope.currentUser);
    if ($scope.currentUser.auth_key) {
      $scope.loadKona();  //only if currentUser is set and has auth_key
    }
  });

  $scope.validatePermission = function (name) {
    return AuthenticationService.hasPermission(name);
  };

  $scope.isAdmin = function () {
    return AuthenticationService.isAdmin();
  };

  $scope.logout = function () {
    AuthenticationService.logout();
  };

  // show/hide nav on main layout based on routing params
  $scope.$on("$routeChangeSuccess", function (evt, current) {
    try {
      console.log(current);
      $scope.showNav = current.showNav;
      $scope.controller = current.controller;
    } catch (ex) {

    }
  });

  // take care of error display
  $scope.$on("errorListUpdated", function (evt, errorList, redirectPath) {
    $scope.errorList = errorList;
    $scope.showError = (errorList) ? true : false;
  });

  $scope.$on("successMessageUpdated", function (evt, successMessage) {
    $scope.showError = false;
    $scope.successMessage = successMessage;
    $scope.showSuccess = (successMessage) ? true : false;
    $scope.showSuccessStart = true; // used to "pause" success message on page following
  });

  // clear out old messages
  $scope.$on('$routeChangeStart', function (scope, next, current) {

    $scope.showError = false;
    if ($scope.showSuccessStart) {
      $scope.showSuccessStart = false;
    } else {
      $scope.showSuccess = false;
    }
  });

  $scope.toggleKona = function () {
    $scope.showKona = !$scope.showKona;
  }

  $scope.loadKona = function () {

    var authToken = $scope.currentUser.auth_key;
//    var defaultKonaSpace = null;
//
//    for(var n=0; n<$scope.currentUser.roles.length; n++) {
//      if($scope.currentUser.roles[n].kona_space_id) {
//        defaultKonaSpace = $scope.currentUser.roles[n].kona_space_id;
//        break;
//      }
//    }
    if (authToken) {
      $window._konaWidgetConfig = {
        id: "conversationsiFrame",
        key: "",
        domain: 'io.kona.com',
        auth_token: authToken,
        container_id: 'myContainer',
//      disable_spaces: true,
//      disable_people: true,
        default_space: '70423',
        theme: 'light'
      };

      var script = document.createElement('script');
      script.src = 'https://' + $window._konaWidgetConfig.domain + '/kona/widgets/kona_widget_loader.js?conversations';
      var insertLocation = document.getElementsByTagName('script')[0];
      insertLocation.parentNode.insertBefore(script, insertLocation);
    }
  };
}]);

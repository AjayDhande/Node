angular.module('laiApp').controller('OpsMonitorCtrl', ['$scope', '$http', '$location', '$route', '$timeout', 'AuthenticationService', 'SearchService', '$window', '$timeout', '$compile', '$q', function ($scope, $http, $location, $route, $timeout, AuthenticationService, SearchService, $window, $timeout, $compile, $q) {

  $scope.add = function () {

    var timestamp = new Date();
    uniqueID = Math.floor(timestamp.getTime() / 10);
    var selector = '[chart-div-id="' + uniqueID + '"]';
    var zIndex = dragresize.getZindex();
    $timeout(function () {
      $('#chartCanvasOpsMonitor').prepend($compile('<lai-chart chart-div-id="' + uniqueID + '" chart-layout-id="opsMonitor"' + '" chart-class="dash-full" class="drsElement" style="left: 150px; top: 280px; width: 325px; height: 325px; background: white; text-align: center; z-index:' + zIndex + '"></lai-chart>')($scope));
    }, 5);

  };

  $scope.deleteChart = function (chartData) {
    var newSections = [];
    if (!$scope.sections) $scope.sections = [];
    for (var i = 0; i < $scope.sections.length; i++) {
      // loop through and remove chart if there
      if ($scope.sections[i].id != chartData.id) {
        newSections.push($scope.sections[i]);
      }
    }
    $scope.sections = newSections;
    var selector = '[chart-div-id="' + chartData.id + '"]';
    $(selector).remove();
//    $scope.saveDashboard();
  };

  $scope.updateChartCoordinates = function (id, left, top, width, height) {
//    if (!$scope.sections) $scope.sections = [];
//    for (var i = 0; i < $scope.sections.length; i++) {
//      // loop through and update existing one if there
//      if ($scope.sections[i].id == id) {
//        $scope.sections[i].coordinates.left = left;
//        $scope.sections[i].coordinates.top = top;
//        $scope.sections[i].coordinates.width = width;
//        $scope.sections[i].coordinates.height = height;
//      }
//    }
//    $scope.saveDashboard();
  };

  $scope.saveDashboard = function () {

  };

  $scope.updateChartSize = function (id) {
//    if (!$scope.sections) $scope.sections = [];
//    for (var n = 0; n < $scope.sections.length; n++) {
//      if (id == $scope.sections[n].layoutId) {
//        $scope.$broadcast('loadChart', $scope.sections[n]);
//      } else if (id == $scope.sections[n].id) {
//        $scope.$broadcast('loadChart', $scope.sections[n]);
//      }
//    }
  };

}]);
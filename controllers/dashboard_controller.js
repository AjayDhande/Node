function searchFromChart(category, caseNames, start, end, dynObject) {
  angular.element(document.getElementById('dashboard_contents')).scope().searchFromChart(category, caseNames, start, end, dynObject);
}

angular.module('laiApp').controller('DashboardCtrl', ['$scope', '$http', '$location', '$route', '$timeout', 'AuthenticationService', 'SearchService', '$window', '$timeout', '$compile', '$q', function ($scope, $http, $location, $route, $timeout, AuthenticationService, SearchService, $window, $timeout, $compile, $q) {
  $scope.$on("clientUpdated", function () {
    // when client is changed reload categories
    $scope.$broadcast('clearChart'); // set all charts to not defined - it wil reload after
    $scope.initDashboard();
  });

  $scope.count = 1;
  $scope.add = function () {

    var timestamp = new Date(), curr_pane = $scope.activePane();
    uniqueID = Math.floor(timestamp.getTime() / 10);
    var selector = '[chart-div-id="' + uniqueID + '"]';
    var zIndex = dragresize.getZindex();
    $timeout(function () {
      $('#chartCanvas' + $scope.panes[curr_pane].id).prepend($compile('<lai-chart chart-div-id="' + uniqueID + '" chart-layout-id="' + $scope.panes[curr_pane].id + '" chart-class="dash-full" class="drsElement" style="left: 150px; top: 280px; width: 325px; height: 325px; background: white; text-align: center; z-index:' + zIndex + '"></lai-chart>')($scope));
    }, 5);

  };

  $scope.activePane = function () {
    for (var n = 0; n < $scope.panes.length; n++) {
      if ($scope.panes[n].active)
        return n;
    }
  };

  $scope.selectActivePane = function () {
    for (var n = 0; n < $scope.panes.length; n++) {
      if ($scope.panes[n].active)
        return $scope.panes[n].id;
    }
  };

  $scope.setActivePane = function () {
    for (var n = 0; n < $scope.panes.length; n++) {
      if ($scope.panes[n].id == $scope.dashboardLayout)
        $scope.panes[n].active = true;
    }
  };

  $scope.$watch('selectActivePane()', function (paneIndex) {
    if (paneIndex != $scope.dashboardLayout) {
      $scope.dashboardLayout = paneIndex;
      $scope.updateChartSize(paneIndex);
      $http.put('dashboard/1.json', {"layout_id": $scope.dashboardLayout, "sections": $scope.sections, "layout_panes": $scope.panes}).
        success(function (data) {
        });
    }
  });

  $scope.panes = [];

  $scope.renameLayout = function (newName) {
    var curr_pane = $scope.activePane(), deferred = $q.defer();
    $scope.panes[curr_pane].title = newName;
    if ($scope.saveDashboard()) {
      deferred.resolve(true);
    }
    return deferred.promise;
  };

  $scope.isRename = function () {
    $scope.isRenaming = !$scope.isRenaming;
  }

  $scope.addLayout = function () {
    var timestamp = new Date();
    uniqueID = Math.floor(timestamp.getTime() / 10);

    $scope.panes.push({title: "New Layout", page: "canvas_blank", id: "New_Layout_" + uniqueID});
    $scope.dashboardLayout = "New_Layout_" + uniqueID;
    $scope.setActivePane();
    $scope.saveDashboard();
  };

// set fusion charts to html rendered rather than flash.
  FusionCharts.setCurrentRenderer('javascript')

  $scope.isRenaming = false;
  $scope.dateVars = {}
  $scope.lockPage = false;
  $scope.dashboardLayout = "";
  $scope.sections = [];
  $scope.clientId = null;
  $scope.chartTypes = [];
  $scope.chartTypesByCategory = [];
// set $scope.chartTypesByCategory to json data got from /chart_types.json
  $http.get('chart_types.json').success(function (data) {
    angular.copy(data, $scope.chartTypesByCategory);
  });

  $scope.updateLayoutOrder = function () {

    var deferred = $q.defer(), tabs = $('.nav-tabs li a tab-heading'),
      newPaneOrder = [];

    for (var n = 0; n < tabs.length; n++) {
      if ($scope.panes[n]) {
        var tempTab = {};
        for (var m = 0; m < $scope.panes.length; m++) {
          if (tabs[n].id == $scope.panes[m].id) {
            tempTab = $scope.panes[m];
          }
        }
        newPaneOrder.push(tempTab);
      }
    }
    $scope.panes = newPaneOrder;
    $scope.setActivePane();
    if ($scope.saveDashboard() == true) {
      deferred.resolve(true);
    }
    return deferred.promise;
  };

  $scope.notifyCharts = function () {
    if ($scope.sections) {
      // now let's loop through the sections and add the charts.
      var sectionHolder = [];
      for (var i = 0; i < $scope.sections.length; i++) {
        var curr_section = $scope.sections[i];
        if (/*curr_section.layoutId == ("layout_id" + $scope.dashboardLayout) && */curr_section.clientId == $scope.clientId) {
          var uniqueID;
          if (!curr_section) {
            var timestamp = new Date();
            uniqueID = Math.floor(timestamp.getTime() / 10);
          } else {
            uniqueID = curr_section.id;
          }
          (function (id, section) {
            $timeout(function () {
              $('#chartCanvas' + section.layoutId).prepend($compile('<lai-chart chart-div-id="' + id + '" chart-layout-id="' + section.layoutId + '" chart-class="dash-full" class="drsElement" style="left: ' + section.coordinates.left + '; top: ' + section.coordinates.top +
                '; width: ' + section.coordinates.width + '; height: ' + section.coordinates.height + '; background: white; text-align: center"></lai-chart>')($scope));
            }, 50);
          })(uniqueID, curr_section);
        }
      }
    }
  }

  $scope.initDashboard = function () {
    AuthenticationService.updateUser().then(function (currentUser) {
      var user = currentUser;
      $scope.dashboardLayout = (user.layout_id) ? user.layout_id : 1;
      angular.copy(user.layout_panes, $scope.panes);
      $scope.fillLayout();
      $scope.clientId = user.current_client_id;
      $scope.setActivePane();
      if (user.sections != $scope.sections) {
        angular.copy(user.sections, $scope.sections);
        $scope.notifyCharts();
      }
    });
  };

  $scope.fillLayout = function () {
    if ($scope.panes.length == 0) {
      $scope.addLayout();
    }
  }

  $scope.initDashboard();

  $scope.saveChart = function (chartData) {
    var deferred = $q.defer();
    var newSections = [];
    if (!$scope.sections) $scope.sections = [];
    for (var i = 0; i < $scope.sections.length; i++) {
      // loop through and update existing one if there
      if ($scope.sections[i].id != chartData.id) {
        newSections.push($scope.sections[i]);
      }
    }
    newSections.push(chartData);
    $scope.sections = newSections;
    if ($scope.saveDashboard() == true) {
      deferred.resolve(true);
    }
    return deferred.promise;
  };

  $scope.saveDashboard = function () {
    // TODOAF fix to not hardcode 1.
    $http.put('dashboard/1.json', {"layout_id": $scope.dashboardLayout, "sections": $scope.sections, "layout_panes": $scope.panes}).
      success(function (data) {
      });
    return true;
  };

  $scope.searchFromChart = function (category, caseNames, start, end, dynObject) {
    var dyn_attr = {};
    for (var prop in dynObject) {
      // important check that this is objects own property
      // not from prototype prop inherited
      if (dynObject.hasOwnProperty(prop)) {
        dyn_attr[prop] = dynObject[prop];
      }
    }
    var dyn_date = {};
    if (start != null && end != null) {
      dyn_date['3_date_filed'] = {
        'start': new Date(start),
        'end': new Date(end),
        'display_name': 'Date Filed'
      };
    }
    var user_search = {};
    var service_query = SearchService.buildQuery(
      "", [category], caseNames, dyn_attr, dyn_date, {}, 1, 50, true);
    SearchService.setSearchBarQuery(service_query);
    $window.location.href = '/#/search_results';
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
    $scope.saveDashboard();
  };

  $scope.deleteLayout = function () {
    var curr_pane = this.$index;
    if (!$scope.sections) $scope.sections = [];
    for (var i = 0; i < $scope.sections.length; i++) {
      // loop through and remove charts from deleted layout if there
      if ($scope.sections[i].layoutId == $scope.panes[curr_pane].id) {
        $scope.deleteChart($scope.sections[i]);
      }
    }
    var newPanes = [];
    for (var n = 0; n < $scope.panes.length; n++) {
      // loop through and remove layout
      if ($scope.panes[n].id != $scope.panes[curr_pane].id) {
        newPanes.push($scope.panes[n]);
      }
    }
    $scope.panes = newPanes;
    $scope.saveDashboard();
  };

  $scope.updateChartCoordinates = function (id, left, top, width, height) {
    if (!$scope.sections) $scope.sections = [];
    for (var i = 0; i < $scope.sections.length; i++) {
      // loop through and update existing one if there
      if ($scope.sections[i].id == id) {
        $scope.sections[i].coordinates.left = left;
        $scope.sections[i].coordinates.top = top;
        $scope.sections[i].coordinates.width = width;
        $scope.sections[i].coordinates.height = height;
      }
    }
    $scope.saveDashboard();
  };

  $scope.updateChartSize = function (id) {
    if (!$scope.sections) $scope.sections = [];
    for (var n = 0; n < $scope.sections.length; n++) {
      if (id == $scope.sections[n].layoutId) {
        $scope.$broadcast('loadChart', $scope.sections[n]);
      } else if (id == $scope.sections[n].id) {
        $scope.$broadcast('loadChart', $scope.sections[n]);
      }
    }
  };
}]);

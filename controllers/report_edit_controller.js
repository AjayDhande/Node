laiApp.controller('ReportEditCtrl',['$scope', '$http', '$window', '$location', '$rootScope', '$modal', 'SearchService', 'AuthenticationService', function ($scope, $http, $window, $location, $rootScope, $modal, SearchService, AuthenticationService) {
  // TODO: This should be coming from the server either as reference data or a
  // separate endpoint.
  // The different report format types.
  $scope.formats = [
    {'id':0, 'type':'CSV'},
    {'id':1, 'type':'Excel'},
    {'id':2, 'type':'PDF'},
  ];

  $scope.report = {
    'name':null,
    'format_id':$scope.formats[0].id,
    'location':'myReports',
    'criteria':{},
    'facets':[],
    'columns':[],
    'share':'private',
    'groups':[]
  };

  $scope.facet_filter = '';

  // Builds the scope model.
  $scope.loadReportData = function (data) {
    angular.copy(data, $scope.report);
  };

  $scope.facetChecked = function (facet) {
    if (facet.checked) {
      $scope.report.columns.push({'name':facet.display_name, 'facet_name':facet.name});
    } else {
      var removeIndex = -1;
      for (var i = 0; i < $scope.report.columns.length; i++) {
        if (facet.display_name === $scope.report.columns[i].name) {
          removeIndex = i;
          break;
        }
      }

      $scope.columns.splice(removeIndex, 1);
    }
  };

  $scope.modifySearch = function (search_criteria) {
    var q = search_criteria.q;

    var category_name = [];
    for (var i = 0; i < search_criteria.categories.length; i++) {
      var category = search_criteria.categories[i];
      category_name.push(category.name);
    }

    var case_name = [];
    for (var j = 0; j < search_criteria.cases.length; j++) {
      var acase = search_criteria.cases[j];
      case_name.push(acase.name);
    }

    var dynamic_attribute = {};
    for (var k = 0; k < search_criteria.other_facets.length; k++) {
      var facet = search_criteria.other_facets[k];
      var facet_name = facet.name;
      var values = dynamic_attribute[facet_name];
      if (!angular.isDefined(values)) {
        values = [];
        dynamic_attribute[facet_name] = values;
      }
      values.push(facet.value);
    }

    var dynamic_date_range = {};
    for (var m = 0; m < search_criteria.date_ranges.length; m++) {
      var filter = search_criteria.date_ranges[m];
      dynamic_date_range[filter.facet_name] = {
        'display_name':filter.display_name,
        'start':filter.from_date,
        'end':filter.to_date
      };
    }

    // Set to reasonable defaults since these are not exposed.
    var dynamic_facet = [];
    var current_page = 1;
    var number_per_page = 50;
    var exclude_filters = true

    var query = SearchService.buildQuery(q, category_name, case_name, dynamic_attribute,
        dynamic_date_range, dynamic_facet, current_page, number_per_page, exclude_filters);
    SearchService.setSearchBarQuery(query);

    $location.path("/search_results");
  };

  $scope.openSaveDialog = function () {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.get('users/' + currentUser.id + '/reports.json').success(function (data) {
        $scope.report_names = [];
        for (var i = 0; i < data.length; i++) {
          $scope.report_names.push(data[i].name);
        }
      });
    });

    var modalInstance = $modal.open({
      templateUrl: '/assets/dialogs/save_report_dialog.html',
      controller: 'SaveReportDialogCtrl',
      resolve: {
        report: function () {
          return $scope.report;
        },
        formats: function () {
          return $scope.formats;
        }
      }
    });

    modalInstance.result.then(function (report) {
      $scope.report = report;
      $scope.saveReport($scope.report);
    }, function () {
      // Do nothing when the modal is dismissed.
    });
  };

  $scope.saveReport = function (report) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.post('users/' + currentUser.id + '/reports.json', report).success(function (data) {
        $rootScope.$broadcast('successMessageUpdated', "Report saved.");
      }).error(function (data, status, headers, config) {
        if (status == 400) { // display validation errors
          $rootScope.$broadcast('errorListUpdated', data.errors);
        } else {
          $rootScope.$broadcast('errorListUpdated', {"500":"An unknown error occurred."});
        }
      });
    });
  };

  $scope.openRunAsDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: '/assets/dialogs/run_report_dialog.html',
      controller: 'RunReportDialogCtrl',
      resolve: {
        report: function () {
          return $scope.report;
        },
        formats: function () {
          return $scope.formats;
        }
      }
    });

    modalInstance.result.then(function () {
    }, function () {
      // Do nothing when the modal is dismissed.
    });
  };

  var data = SearchService.getReportData();
  $scope.loadReportData(data);
}]);

function toggleReport(searchId) {
  angular.element(document.getElementById('reportsTable')).scope().toggleReport(searchId);
}

laiApp.controller('ReportsCtrl', ['$scope', '$http', '$route', '$location', 'SearchService', 'AuthenticationService', function ($scope, $http, $route, $location, SearchService, AuthenticationService) {
  $scope.rowClicked = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $('td:eq(0)', nRow).bind('click', function () {
      $scope.$apply(function () {
        $scope.runReportClickHandler(aData);
      });
    });

    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.deleteHandler = function (info) {
    info.checked = !info.checked;
    for (var i = 0; i < $scope.reports.length; i++) {
      var report = $scope.reports[i];
      if (report.id === info.id) {
        report.checked = info.checked;
      }
    }
  };

  $scope.runReportClickHandler = function (info) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.get('/users/' + currentUser.id + '/reports/' + info.id + '.json', {
        transformResponse: function (data, headers) {
          // We need to convert the integer value returned by the server to a date.
          var report = JSON.parse(data);
          for (var facet_name in report.criteria.dynamic_date_range) {
            if (report.criteria.dynamic_date_range.hasOwnProperty(facet_name)) {
              var values = report.criteria.dynamic_date_range[facet_name];
              var start = new Date(values['start']);
              var end = new Date(values['end']);
              report.criteria.dynamic_date_range[facet_name]['start'] = start;
              report.criteria.dynamic_date_range[facet_name]['end'] = end;
            }
          }

          return report;
        }
      }).success(function (data) {
          var report = data;

          // Emit a message so that the client bar will be updated.
          $scope.$emit('handleUpdateClientEmit', {'client_id': info.client_id});

          SearchService.setReportData(report);
          $location.path("/report_edit");
        });
    });
  };

  $scope.columnDefs = [
    { "mDataProp": "id", "aTargets": [0], "bVisible": false},
    { "mDataProp": "client_id", "aTargets": [1], "bVisible": false},
    { "mDataProp": "name", "aTargets": [2]},
    { "mDataProp": "title", "aTargets": [3]},
    { "mDataProp": "format_type", "aTargets": [4]},
    { "mDataProp": "client_name", "aTargets": [5]},
    { "mDataProp": "checked", "aTargets": [6], "mRender": function (data, type, full) {
      var cb = '<input type="checkbox" id="' + full.id + '"';
      if (data == true) {
        cb = cb + ' value="true" checked';
      } else {
        cb = cb + ' value="false"';
      }
      cb = cb + ' onclick="toggleReport(' + full.id + ')"';
      cb = cb + '/>';
      return cb;
    } }
  ];

  $scope.overrideOptions = {
  };

  $scope.deleteReports = function (reports) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      for (var i = 0; i < reports.length; i++) {
        if (reports[i].checked == true) {
          // We are using this format because we need to explicitly specify data
          // in order for angular to send the content-type header.
          $http({
            method: 'DELETE',
            url: '/users/' + currentUser.id + '/reports/' + reports[i].id + '.json',
            data: ''
          }).success(function (data) {
            var reports = $scope.buildReports(data);
            angular.copy(reports, $scope.reports);
          });
        }
      }
    });
  };

  $scope.buildReports = function (data) {
    var reports = [];
    for (var i = 0; i < data.length; i++) {
      reports.push({
        "id": data[i].id,
        "name": data[i].name,
        "title": data[i].title,
        "format_type": data[i].format_type,
        "client_id": data[i].client.id,
        "client_name": data[i].client.name,
        "checked": false});
    }

    return reports;
  }

  $scope.toggleReport = function (searchId) {
    for (var i = 0; i < $scope.reports.length; i++) {
      if ($scope.reports[i].id === searchId) {
        $scope.reports[i].checked = !$scope.reports[i].checked;
      }
    }
  }

  $scope.reports = [];

  AuthenticationService.getCurrentUser().then(function (currentUser) {
    $http.get('/users/' + currentUser.id + '/reports.json').success(function (data) {
      var reports = $scope.buildReports(data);
      angular.copy(reports, $scope.reports);
    });
  });
}]);

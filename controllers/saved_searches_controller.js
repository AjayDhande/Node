function toggleBriefcase(searchId) {
  angular.element(document.getElementById('briefcasesTable')).scope().toggleBriefcase(searchId);
}

laiApp.controller('SavedSearchesCtrl', ['$scope', '$http', '$location', 'SearchService', 'AuthenticationService', function ($scope, $http, $location, SearchService, AuthenticationService) {
  $scope.rowClicked = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $('td:eq(0)', nRow).bind('click', function () {
      $scope.$apply(function () {
        $scope.runSearchClickHandler(aData);
      });
    });

    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.deleteHandler = function (info) {
    info.checked = !info.checked;
    for (var i = 0; i < $scope.user_searches.length; i++) {
      var user_search = $scope.user_searches[i];
      if (user_search.id === info.id) {
        user_search.checked = info.checked;
      }
    }
  };

  $scope.runSearchClickHandler = function (info) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.get('/users/' + currentUser.id + '/user_searches/' + info.id + '.json', {
        transformResponse: function (data, headers) {
          // We need to convert the integer value returned by the server to a date.
          var user_search = JSON.parse(data);
          for (var facet_name in user_search.criteria.dynamic_date_range) {
            if (user_search.criteria.dynamic_date_range.hasOwnProperty(facet_name)) {
              var values = user_search.criteria.dynamic_date_range[facet_name];
              var start = new Date(values['start']);
              var end = new Date(values['end']);
              user_search.criteria.dynamic_date_range[facet_name]['start'] = start;
              user_search.criteria.dynamic_date_range[facet_name]['end'] = end;
            }
          }

          return user_search;
        }
      }).success(function (data) {
          var user_search = data;
          // TODO: Come up with a better way of setting the results per page.
          var service_query = SearchService.buildQuery(
            user_search.criteria.q, user_search.criteria.category_name,
            user_search.criteria.case_name, user_search.criteria.dynamic_attribute,
            user_search.criteria.dynamic_date_range, {}, 1, 50, true);

          // Emit a message so that the client bar will be updated.
          $scope.$emit('handleUpdateClientEmit', {'client_id': info.client_id});

          // Listen for a notification that the client bar has been updated. This
          // is being done to prevent a synchronization issue that results in the
          // saved search results being overwritten by a default search.
          $scope.$on("clientUpdated", function () {
            SearchService.setSearchBarQuery(service_query);
            $location.path("/search_results");
          });
        });
    });
  };

  $scope.columnDefs = [
    { "mDataProp": "id", "aTargets": [0], "bVisible": false},
    { "mDataProp": "client_id", "aTargets": [1], "bVisible": false},
    { "mDataProp": "name", "aTargets": [2]},
    { "mDataProp": "client_name", "aTargets": [3]},
    { "mDataProp": "checked", "aTargets": [4], "mRender": function (data, type, full) {
      var cb = '<input type="checkbox" id="' + full.id + '"';
      if (data == true) {
        cb = cb + ' value="true" checked';
      } else {
        cb = cb + ' value="false"';
      }
      cb = cb + ' onclick="toggleBriefcase(' + full.id + ')"';
      cb = cb + '/>';
      return cb;
    } }
  ];

  $scope.overrideOptions = {
  };

  $scope.deleteSearches = function (user_searches) {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      for (var i = 0; i < user_searches.length; i++) {
        if (user_searches[i].checked == true) {
          // We are using this format because we need to explicitly specify data
          // in order for angular to send the content-type header.
          $http({
            method: 'DELETE',
            url: '/users/' + currentUser.id + '/user_searches/' + user_searches[i].id + '.json',
            data: ''
          }).success(function (data) {
            var user_searches = $scope.buildUserSearches(data);
            angular.copy(user_searches, $scope.user_searches);
          });
        }
      }
    });
  };

  $scope.buildUserSearches = function (data) {
    var user_searches = [];
    for (var i = 0; i < data.length; i++) {
      user_searches.push({
        "id": data[i].id,
        "name": data[i].name,
        "client_id": data[i].client.id,
        "client_name": data[i].client.name,
        "checked": false});
    }

    return user_searches;
  };

  $scope.toggleBriefcase = function (searchId) {
    for (var i = 0; i < $scope.user_searches.length; i++) {
      if ($scope.user_searches[i].id === searchId) {
        $scope.user_searches[i].checked = !$scope.user_searches[i].checked;
      }
    }
  }

  $scope.user_searches = [];

  AuthenticationService.getCurrentUser().then(function (currentUser) {
    $http.get('/users/' + currentUser.id + '/user_searches.json').success(function (data) {
      var user_searches = $scope.buildUserSearches(data);
      angular.copy(user_searches, $scope.user_searches);
    });
  });
}]);

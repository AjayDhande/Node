laiApp.controller('SearchResultsCtrl',['$scope', '$http', '$location', '$rootScope', '$modal', 'SearchService', 'AuthenticationService', function ($scope, $http, $location, $rootScope, $modal, SearchService, AuthenticationService) {
  $scope.$on("clientUpdated", function () {
    // The client was changed. We do not have many options other than
    // to perform a default search.
    var query = SearchService.buildQuery(
        '', // query
        [], // category name
        [], // case name
        {}, // dynamic attributes
        {}, // dynamic date ranges
        {}, // dynamic facets
        1, // current page
        50, // results per page
        true); // exclude filters

    $scope.executeSearch(query);
  });

  // Convert facet name to facet display name (e.g. '0_judge_full_name'
  // to 'Judge Full Name'.
  $scope.buildFacetDisplayName = function (facet_name) {
    // Drop the facet type and replace underscores with spaces.
    var name = facet_name.substr(2).replace(/_/g, " ");
    // Capitalize the first letter of each word.
    name = name.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return name;
  };

  $scope.buildSearchCriteria = function (query) {
    var criteria = {
      'q':query.q,
      'cases':[],
      'categories':[],
      'other_facets':[],
      'date_ranges':[],
      'current_page':query.current_page,
      'number_per_page':query.number_per_page
    };

    for (var i = 0; i < query.case_name.length; i++) {
      var case_name = query.case_name[i];
      criteria.cases.push({'name':case_name, 'checked':true});
    }

    for (var j = 0; j < query.category_name.length; j++) {
      var category_name = query.category_name[j];
      criteria.categories.push({'name':category_name, 'checked':true});
    }

    for (var facet_name in query.dynamic_attribute) {
      if (query.dynamic_attribute.hasOwnProperty(facet_name)) {
        var display_name = $scope.buildFacetDisplayName(facet_name);
        var values = query.dynamic_attribute[facet_name];
        for (var x = 0; x < values.length; x++) {
          var value = values[x];
          criteria.other_facets.push({
            'display_name':display_name,
            'name':facet_name,
            'value':value,
            'checked':true
          });
        }
      }
    }

    for (var facetName in query.dynamic_date_range) {
      if (query.dynamic_date_range.hasOwnProperty(facetName)) {
        var date_range = query.dynamic_date_range[facetName];
        criteria.date_ranges.push({
          'display_name':date_range.display_name,
          'facet_name':facetName,
          'from_date':date_range.start,
          'to_date':date_range.end
        });
      }
    }

    angular.copy(criteria, $scope.search.criteria);
  };

  $scope.buildSearchResults = function (results) {
    var search_results = {
      'cases':[],
      'number_of_pages':0,
      'total':0
    };

    for (var case_name in results.hits) {
      if (results.hits.hasOwnProperty(case_name)) {
        var hits = results.hits[case_name];
        var case_id = -1;
        var sources = [];
        for (var i = 0; i < hits.length; i++) {
          // We need the case ID to display a link to the case. We do not want
          // to have to iterate over the sources to find it.
          case_id = hits[i].case_id;
          sources.push({'source_name':hits[i].file_name, 'source_id':hits[i].source_id, 'case_id':hits[i].case_id,
            'category_name':hits[i].category_name, 'highlights':hits[i].highlights});
        }
        search_results.cases.push({'case_name':case_name, 'case_id':case_id, 'sources':sources, 'is_collapsed':true});
      }
    }

    search_results.number_of_pages = results.total_pages;
    search_results.total = results.total;

    angular.copy(search_results, $scope.search.results);
  };

  $scope.buildSearchFacets = function (results, criteria) {
    var facets = {
      'cases':[],
      'categories':[],
      'other_facets':{}
    };

    for (var i = 0; i < results.case_name_facets.length; i++) {
      var facet = results.case_name_facets[i];
      var checked = $scope.checkCaseFacet(facet.value, criteria.cases);
      var acase = {
        'value':facet.value,
        'count':facet.count,
        'checked':checked
      };
      facets.cases.push(acase);
    }
    ;

    for (var j = 0; j < results.category_name_facets.length; j++) {
      var facet = results.category_name_facets[j];
      var checked = $scope.checkCategoryFacet(facet.value, criteria.categories);
      var category = {
        'value':facet.value,
        'count':facet.count,
        'checked':checked
      };
      facets.categories.push(category);
    }
    ;

    var display_names = [];
    var date_attributes = [];
    for (var display_name in results.other_facets) {
      if (results.other_facets.hasOwnProperty(display_name)) {
        display_names.push(display_name);
        var result_facets = results.other_facets[display_name];
        var facet_name = '';
        for (var k = 0; k < result_facets.length; k++) {
          var facet = result_facets[k];
          var checked = $scope.checkOtherFacet(facet, criteria.other_facets);
          var other_facet = {
            'display_name':display_name,
            'name':facet.name,
            'value':facet.value,
            'count':facet.count,
            'checked':checked
          };

          var other_facets = facets.other_facets[display_name];
          // If the facet is not already being tracked in the facets.other_facets
          // hash, then define a new array for the values and add it to the hash.
          if (!angular.isDefined(other_facets)) {
            other_facets = [];
            facets.other_facets[display_name] = other_facets;
          }

          other_facets.push(other_facet);

          facet_name = facet.name;
        }

        // Check if the facet name is for a date value.
        if (facet_name.lastIndexOf('3_', 0) === 0) {
          date_attributes.push({'display_name':display_name, 'facet_name':facet_name});
        }
      }
    }

    angular.copy(facets, $scope.search.facets);
    angular.copy(display_names, $scope.attribute_display_names);
    angular.copy(date_attributes, $scope.date_attributes);

    if ($scope.date_attributes.length > 0) {
      $scope.date_attribute = $scope.date_attributes[0];
    }
  };

  $scope.checkCaseFacet = function (name, cases) {
    if (angular.isDefined(cases)) {
      for (var i = 0; i < cases.length; i++) {
        var acase = cases[i];
        if (acase.name === name) {
          return true;
        }
      }
      ;
    }

    return false;
  };

  $scope.checkCategoryFacet = function (name, categories) {
    if (angular.isDefined(categories)) {
      for (var i = 0; i < categories.length; i++) {
        var category = categories[i];
        if (category.name === name) {
          return true;
        }
      }
      ;
    }

    return false;
  };

  $scope.checkOtherFacet = function (facet, other_facets) {
    if (angular.isDefined(other_facets)) {
      for (var i = 0; i < other_facets.length; i++) {
        var other_facet = other_facets[i];
        if ((facet.name === other_facet.name) &&
            (facet.value === other_facet.value)) {
          return true;
        }
      }
    }

    return false;
  };

  $scope.caseFacetChecked = function (case_name, checked, criteria) {
    if (checked) {
      // We are adding a case to the search.
      criteria.cases.push({'name':case_name, 'checked':checked});
    } else {
      // We are removing a case from the search.
      for (var i = 0; i < criteria.cases.length; i++) {
        var acase = criteria.cases[i];
        if (case_name === acase.name) {
          acase.checked = checked;
          break;
        }
      }
    }

    $scope.updateSearch(criteria, 1);
  };

  $scope.categoryFacetChecked = function (category_name, checked, criteria) {
    if (checked) {
      // We are adding a category to the search.
      criteria.categories.push({'name':category_name, 'checked':checked});
    } else {
      // We are removing a category from the search.
      for (var i = 0; i < criteria.categories.length; i++) {
        var category = criteria.categories[i];
        if (category_name === category.name) {
          category.checked = checked;
          break;
        }
      }
    }

    $scope.updateSearch(criteria, 1);
  };

  $scope.otherFacetChecked = function (facet, criteria) {
    if (facet.checked) {
      // We are adding a dynamic attribute to the search.
      criteria.other_facets.push({
        'display_name':facet.display_name,
        'name':facet.name,
        'value':facet.value,
        'checked':facet.checked
      });
    } else {
      // We are removing a dynamic attribute from the search.
      for (var i = 0; i < criteria.other_facets.length; i++) {
        var other_facet = criteria.other_facets[i];
        if ((facet.name === other_facet.name) && (facet.value === other_facet.value)) {
          other_facet.checked = facet.checked;
          break;
        }
      }
    }

    $scope.updateSearch(criteria, 1);
  };

  $scope.addDateFilter = function (attribute, from, to, criteria) {
    criteria.date_ranges.push({'display_name':attribute.display_name,
      'facet_name':attribute.facet_name, 'from_date':from, 'to_date':to});

    $scope.updateSearch(criteria, 1);
  };

  $scope.removeDateFilter = function (criteria, index) {
    criteria.date_ranges.splice(index, 1);

    $scope.updateSearch(criteria, 1);
  };

  $scope.enableEditQuery = function (enabled) {
    $scope.edit_query = enabled;
  };

  $scope.pageChanged = function (page) {
    $scope.updateSearch($scope.search.criteria, page);
  };

  $scope.updateSearch = function (criteria, page) {
    criteria.current_page = page;

    var case_name = $scope.getCaseNames(criteria);

    var category_name = $scope.getCategoryNames(criteria);

    var dynamic_attribute = $scope.getOtherFacets(criteria);

    var dynamic_date_range = $scope.getDynamicDateRanges(criteria);

    var service_query = SearchService.buildQuery(
        criteria.q, // query
        category_name, // category name
        case_name, // case name
        dynamic_attribute, // dynamic attributes
        dynamic_date_range, // dynamic date ranges
        {}, // dynamic facets
        criteria.current_page, // current page
        criteria.number_per_page, // results per page
        true); // exclude filters

    $scope.executeSearch(service_query);
  };

  $scope.getCaseNames = function (criteria) {
    var case_name = [];
    for (var i = 0; i < criteria.cases.length; i++) {
      if (criteria.cases[i].checked === true) {
        case_name.push(criteria.cases[i].name);
      }
    }
    return case_name;
  };

  $scope.getCategoryNames = function (criteria) {
    var category_name = [];
    for (var i = 0; i < criteria.categories.length; i++) {
      if (criteria.categories[i].checked === true) {
        category_name.push(criteria.categories[i].name);
      }
    }
    return category_name;
  };

  $scope.getOtherFacets = function (criteria) {
    var dynamic_attribute = {};
    for (var i = 0; i < criteria.other_facets.length; i++) {
      var other_facet = criteria.other_facets[i];
      if (other_facet.checked) {
        var attributes = dynamic_attribute[other_facet.name];
        if (!angular.isDefined(attributes)) {
          attributes = [];
          dynamic_attribute[other_facet.name] = attributes;
        }

        attributes.push(other_facet.value);
      }
    }

    return dynamic_attribute;
  };

  $scope.getDynamicDateRanges = function (criteria) {
    var dynamic_date_range = {};
    for (var i = 0; i < criteria.date_ranges.length; i++) {
      var filter = criteria.date_ranges[i];
      dynamic_date_range[filter.facet_name] = {
        'display_name':filter.display_name,
        'start':filter.from_date,
        'end':filter.to_date
      };
    }
    return dynamic_date_range;
  };

  $scope.executeSearch = function (query) {
    SearchService.search(query).then(function (data) {
      $scope.buildSearchCriteria(query);
      $scope.buildSearchResults(data);
      $scope.buildSearchFacets(data, $scope.search.criteria);
    });
  };

  $scope.search = {
    'criteria':{
      'q':'',
      'cases':[],
      'categories':[],
      'other_facets':[],
      'date_ranges':[],
      'current_page':1,
      'number_per_page':50
    },
    'results':{
      'cases':[],
      'number_of_pages':0,
      'total':0
    },
    'facets':{
      'cases':[],
      'categories':[],
      'other_facets':{}
    }
  };

  $scope.edit_query = false;
  $scope.case_name_filter = '';
  $scope.attribute_display_name = '';
  $scope.attribute_display_names = [];
  $scope.attribute_filter = '';
  $scope.date_attributes = [];
  $scope.date_attribute = {};
  $scope.from_date = null;
  $scope.to_date = null;

  // Execute the search on page load.
  $scope.executeSearch(SearchService.getSearchBarQuery());

  $scope.openSaveDialog = function () {
    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.get('users/' + currentUser.id + '/user_searches.json').success(function (data) {
        $scope.user_search_names = [];
        for (var i = 0; i < data.length; i++) {
          $scope.user_search_names.push(data[i].name);
        }
      });
    });

    $scope.user_search = {
      'name':null,
      'location':'myBriefcase',
      'share':'private',
      'groups':[],
      'criteria':{}
    };

    var modalInstance = $modal.open({
      templateUrl: '/assets/dialogs/save_search_dialog.html',
      controller: 'SaveSearchDialogCtrl',
      resolve: {
        userSearch: function () {
          return $scope.user_search;
        }
      }
    });

    modalInstance.result.then(function (userSearch) {
      $scope.user_search = userSearch;
      $scope.saveSearch($scope.search.criteria);
    }, function () {
      // Do nothing when the modal is dismissed.
    });
  };

  $scope.saveSearch = function (criteria) {
    $scope.user_search.criteria.q = criteria.q;
    $scope.user_search.criteria.case_name = $scope.getCaseNames(criteria);
    $scope.user_search.criteria.category_name = $scope.getCategoryNames(criteria);
    $scope.user_search.criteria.dynamic_attribute = $scope.getOtherFacets(criteria);
    $scope.user_search.criteria.dynamic_date_range = $scope.getDynamicDateRanges(criteria);

    AuthenticationService.getCurrentUser().then(function (currentUser) {
      $http.post('users/' + currentUser.id + '/user_searches.json', $scope.user_search).success(function (data) {
        $rootScope.$broadcast('successMessageUpdated', "Search saved.");
      }).error(function (data, status, headers, config) {
        if (status == 400) { // display validation errors
          $rootScope.$broadcast('errorListUpdated', data.errors);
        } else {
          $rootScope.$broadcast('errorListUpdated', {"500":"An unknown error occurred."});
        }
      });
    });
  };

  $scope.buildReport = function (criteria, other_facets) {
    // TODO: Not sure that this belongs here, but it makes going to
    // the edit report page simpler if this is done here.
    var facets = [];
    facets.push({'display_name':'Category Name', 'name':null, 'checked':false});
    facets.push({'display_name':'Source Name', 'name':null, 'checked':false});
    facets.push({'display_name':'Hit', 'name':null, 'checked':true});
    for (var display_name in other_facets) {
      if (other_facets.hasOwnProperty(display_name)) {
        var facet_values = other_facets[display_name];
        if (angular.isDefined(facet_values) && facet_values.length > 0) {
          var facet_name = facet_values[0].name;
          facets.push({'display_name':display_name, 'name':facet_name, 'checked':false});
        }
      }
    }

    var report_data = {
      'name':null,
      'format_id':0,
      'location':'myReports',
      'criteria':criteria,
      'facets':facets,
      'columns':[
        {'name':'Hit', 'facet_name':null}
      ],
      'share':'private',
      'groups':[]
    };

    SearchService.setReportData(report_data);
    $location.path("/report_edit");
  };
}]);

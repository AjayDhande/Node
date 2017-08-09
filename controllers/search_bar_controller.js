angular.module('laiApp').controller('SearchBarCtrl',['$scope', '$http', '$location', '$route', 'SearchService', function ($scope, $http, $location, $route, SearchService) {
  $scope.$on("clientUpdated", function () {
    // when client is changed reload categories
    $scope.loadCategories();
  });

  $scope.loadCategories = function () {
    $http.get('categories.json').success(function (data) {
      angular.copy(data, $scope.categories);
      var default_category = {id:-1, name:'All'};
      $scope.categories.unshift(default_category);
    });
  }

  $scope.updateCategory = function (category) {
    $scope.search_criteria.category_name = category.name;
  }

  $scope.search = function (criteria) {
    var q = criteria.q;
    var category_name = [];
    if (criteria.category_name !== 'All') {
      category_name.push(criteria.category_name);
    }

    // Set to reasonable defaults since these are not exposed by the search bar.
    var case_name = [];
    var dynamic_attribute = {};
    var dynamic_date_range = {};
    var dynamic_facet = [];
    var current_page = 1;
    var number_per_page = 50;
    var exclude_filters = true;

    var query = SearchService.buildQuery(q, category_name, case_name, dynamic_attribute,
        dynamic_date_range, dynamic_facet, current_page, number_per_page, exclude_filters);
    SearchService.setSearchBarQuery(query);

    // Reset the search bar.
    $scope.search_criteria.q = '';
    $scope.search_criteria.category_name = 'All';

    // TODO: Need a better way to refresh search page when user alters query while
    // viewing previous search results.
    if ($location.path().indexOf("/search_results") !== -1) {
      $route.reload();
    } else {
      $location.path("/search_results");
    }
  };

  $scope.categories = [];

  $scope.search_criteria = {'category_name':'All', 'q':''};

  $scope.loadCategories();
}]);

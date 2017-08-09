laiApp.controller('AnalyticsCtrl',["$scope", function ($scope) {
  $scope.analytics = [
    {'name':'Cases With Outcomes', 'page':'/assets/analysis/cases_with_outcomes.html'},
    {'name':'Pending Cases', 'page':'/assets/analysis/pending_cases.html'}
  ];

  $scope.selected_analytics = $scope.analytics[0];
}]);

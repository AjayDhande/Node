laiApp.controller('AnalysisCtrl', ['$scope',function ($scope) {
  $scope.tabs = [
    {'title':'Link Analysis', 'active':true, 'page':'/assets/analysis/link_analysis.html'},
    {'title':'Analytics', 'active':false, 'page':'/assets/analysis/analytics.html'}
  ];
}]);

laiApp.controller('BriefcasesCtrl',['$scope', function ($scope) {

  $scope.panes = [
    { title:"Saved Searches", page:"saved_searches_list" },
    { title:"myReports", page:"reports_list" },
    { title:"History", page:"history_list" }
  ];

  $scope.pane = $scope.panes[0].active = true

}]);

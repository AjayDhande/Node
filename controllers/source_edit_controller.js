angular.module('laiApp').controller('SourceEditCtrl',['$scope', '$http', '$routeParams', '$rootScope', 'PageService', function ($scope, $http, $routeParams, $rootScope, PageService) {

  // get initial data including the source, the category and sub data.
  $http.get('/cases/' + $routeParams.caseId + '/sources/' + $routeParams.sourceId + '/edit.json').success(function (data) {
    $scope.source = data;
    $scope.category = data.category;
    $scope.attrs = data.category.category_attributes;
    PageService.setTitle(data.case_name);
  });

  // once document is loaded then load annotations
  $scope.docLoaded = function (totalPages) {
    window.FlexPaperViewer_InstancedocumentViewer.getApi().addMarks($scope.source.annotations);
  }

  // load categories for dropdown selection
  $http.get('/categories.json').success(function (data) {
    $scope.categories = data;
  });

  // when the dropdown selection of category changes, load the new category attributes
  // and the values related to the source (if they exist).
  $scope.$watch('source.category_id', function () {
    if ($scope.source) {
      $http.get('/categories/' + $scope.source.category_id + '.json?source_id=' + $routeParams.sourceId).success(function (data) {
        $scope.category = data;
        $scope.attrs = data.category_attributes;
      });
    }
  });

  $scope.viewOriginal = function () {
    window.open($scope.source.orig_attachment_url);
  };

  $scope.updateSourceValues = function () {
    //form object to send back to server
    var annotations = window.FlexPaperViewer_InstancedocumentViewer.getApi().getMarkList();
    var updateSource = {"id":$scope.source.id, "annotations":annotations,
      "category":{"id":$scope.category.id}};  // set id and category id to update server
    updateSource.category.attrs = $scope.attrs;  // add all attribute values
    $http.put('/cases/' + $routeParams.caseId + '/sources/' + $routeParams.sourceId, updateSource).success(function (data) {
      $rootScope.$broadcast('successMessageUpdated', "Source updated.");
    });
  };

}]);
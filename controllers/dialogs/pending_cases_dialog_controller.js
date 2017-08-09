laiApp.controller('PendingCasesDialogCtrl', ['$scope', '$modalInstance', 'chartAttributes', 'facetFilters', function PendingCasesDialogCtrl($scope, $modalInstance, chartAttributes, facetFilters) {
  $scope.chart_attributes = chartAttributes;
  $scope.facet_filters = facetFilters;

  $scope.ok = function () {
    $modalInstance.close($scope.chart_attributes);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.addChartAttribute = function () {
    var facets = [];
    angular.copy($scope.facet_filters, facets);

    $scope.chart_attributes.push({
      'facets':facets,
      'facet':facets[0],
      'value':facets[0].values[0].value
    });
  };

  $scope.removeChartAttribute = function (index) {
    $scope.chart_attributes.splice(index, 1);
  };

  $scope.setDefaultChartAttributeValue = function (chart_attribute) {
    chart_attribute.value = chart_attribute.facet.values[0].value;
  };
}]);

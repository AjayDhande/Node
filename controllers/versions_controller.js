angular.module('laiApp').controller('VersionsCtrl',['$scope', '$http',function ($scope, $http) {
  $scope.audits = []; // initialize to avoid js error with directive
  $scope.myCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.columnDefs = [
    { "mDataProp":"whodunnit", "aTargets":[0]},
    { "mDataProp":"action_text", "aTargets":[1] },
    { "mDataProp":"description", "aTargets":[2] },
    { "mDataProp":"created_at", "aTargets":[3],
      "mRender":function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      } }
  ];

  $scope.overrideOptions = {
    "bDestroy":false,
    "bPaginate":true,
    "bDeferRender":true,
    "bServerSide":true,
    "bProcessing":true,
    "sAjaxSource":'/versions.json',
    "bSort":false,
    "sPaginationType":"full_numbers",
    "bAutoWidth":false
  };

}]);
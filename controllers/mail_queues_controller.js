angular.module('laiApp').controller('MailQueuesCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
  $scope.myCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $(nRow).bind('click', function () {
      var self = this;
      $scope.$apply(function () {
        $scope.editMailQueueHandler(aData);
      });
    });
    $(nRow).addClass("hoverable");
    return nRow;
  };

  $scope.editMailQueueHandler = function (info) {
    $location.path("/mail_queues/" + info.id + "/edit");
  };

  $scope.columnDefs = [
    { "mDataProp":"id", "aTargets":[0], "bVisible":false},
    { "mDataProp":"name", "aTargets":[1]},
    { "mDataProp":"description", "aTargets":[2] },
    { "mDataProp":"email", "aTargets":[3] }
  ];

  $scope.overrideOptions = {
    "bDestroy":false,
    "bPaginate":true,
    "bDeferRender":true,
    "bServerSide":true,
    "bProcessing":true,
    "sAjaxSource":'/mail_queues.json',
    "bSort":false,
    "sPaginationType":"full_numbers",
    "bAutoWidth":false
  };

  $scope.createNew = function () {
    $location.path("/mail_queues/new");
  };
}]);
angular.module('laiApp').controller('WorkQImportCtrl', ['$scope', '$http', '$compile', '$location', '$rootScope', '$route', '$timeout', function ($scope, $http, $compile, $location, $rootScope, $route, $timeout) {

  $scope.closeUploadDialog = function () {
    $scope.uploadDialogShouldBeOpen = false;
    if ($scope.finishedUpload()) {
      $timeout(function () {
        $route.reload();
      }, 0);
    }
  };

  $scope.upload_opts = {
    backdropFade: true,
    dialogFade: true
  };

  $scope.newTask = {
    'name': null,
    'description': null,
    'units': null,
    'sources': []
  };

  $scope.submit = function () {
    var tempFiles = angular.element(document.getElementById('fileupload')).scope().queue, allFilesHaveCategories = true, allFilesHaveCaseIDs = true;
    for (var n = 0; n < tempFiles.length; n++) {
      if (!tempFiles[n].category)
        allFilesHaveCategories = false;
      if (!tempFiles[n].caseID)
        allFilesHaveCaseIDs = false;
    }
    //create new task/unit before uploading
    if (allFilesHaveCategories && allFilesHaveCaseIDs) {
      $http.post('/tasks.json', $scope.newTask).success(function (data) {
        $scope.uploadingNow = true;
        angular.element(document.getElementById('fileupload')).scope().submit(data.id);
      });
    } else {
      alert('Please enter a case/category for all files.');
    }
  }

  $scope.cancel = function () {
    angular.element(document.getElementById('fileupload')).scope().cancel();
  }

  $scope.checkFiles = function () {
    if (angular.element(document.getElementById('fileupload')).scope()) {
      return angular.element(document.getElementById('fileupload')).scope().checkFiles();

    }
  }

  $scope.finishedUpload = function () {
    if (angular.element(document.getElementById('fileupload')).scope()) {
      return angular.element(document.getElementById('fileupload')).scope().finishedUpload;
    }
  }

  $scope.openFSDialog = function () {
    $('#fileinputtag').click();
  }

}]);

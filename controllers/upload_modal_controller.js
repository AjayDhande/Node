/**
 * Created with JetBrains RubyMine.
 * User: wesleywu
 * Date: 10/14/13
 * Time: 3:32 PM
 * To change this template use File | Settings | File Templates.
 */

angular.module('laiApp').config([
    '$httpProvider', 'fileUploadProvider',
    function ($httpProvider, fileUploadProvider) {
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
      fileUploadProvider.defaults.redirect = window.location.href.replace(
        /\/[^\/]*$/,
        '/cors/result.html?%s'
      );
    }
  ])
  .controller('DemoFileUploadController', [
    '$scope', '$http',
    function ($scope, $http) {
      $scope.options = {};
      $scope.loadingFiles = false;
      $scope.queue = [];
      $scope.cases = [];
      $scope.categories = [];

      $scope.setCases = function (caseId) {
        for(var n=0; n<$scope.queue.length; n++) {
          $scope.queue[n].caseID = caseId;
        }
      };

      if ($scope.cases.length == 0) {
        $http.get('/cases.json').success(function (data) {
          for (var n = 0; n < data.length; n++) {
            $scope.cases[n] = {'id': data[n].id, 'name': data[n].name};
          }
        });


        $http.get('/categories.json').success(function (data) {
          for (var n = 0; n < data.length; n++) {
            $scope.categories[n] = {'id': data[n].id, 'name': data[n].name};
          }
        });
      }
    }
  ])

  .controller('FileDestroyController', [
    '$scope', '$http',
    function ($scope, $http) {
      var file = $scope.file,
        state;
      if (file.url) {
        file.$state = function () {
          return state;
        };
        file.$destroy = function () {
          state = 'pending';
          return $http({
            url: file.deleteUrl,
            method: file.deleteType
          }).then(
            function () {
              state = 'resolved';
              $scope.clear(file);
            },
            function () {
              state = 'rejected';
            }
          );
        };
      } else if (!file.$cancel && !file._index) {
        file.$cancel = function () {
          $scope.clear(file);
        };
      }
    }
  ]);
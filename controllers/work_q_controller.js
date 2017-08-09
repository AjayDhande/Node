angular.module('laiApp').controller('WorkQCtrl', ['$scope', '$http', '$compile', '$location', '$rootScope', '$route', '$timeout', function ($scope, $http, $compile, $location, $rootScope, $route, $timeout) {

  $scope.tasks = []; // initialize to avoid js error with directive
  $scope.queues = [];


  // get current user role to determine what they can/cannot sett
  $http.get('users/1.json').success(function (data) {  // NOTE: since this call always gets current user, doesn't matter the user passed.
    $scope.user = data;
    //var isManager = (data.permissions[0].object.indexOf("User")!=-1);// if the current user can manage other users then they are a manager
    var isManager = 1;
    // TODOAF not good since this is all client side - security issue
    $scope.workQTypes = [
      {'id': '0', 'value': 'My Tasks'}
    ];
    if (isManager) $scope.workQTypes.push({'id': '1', 'value': 'All Tasks I Can See'});
    $scope.listBy = $scope.workQTypes[0].id; // initialize

    // load list of mail queues in drop down
    $http.get('mail_queues.json').success(function (data) {
      if (data && data.aaData) {
        for (var i = 0; i < data.aaData.length; i++) {
          data.aaData[i].value = data.aaData[i].name;
        }
        data.aaData.unshift({'id': null, 'value': 'All Queues', 'name': 'All Queues'})
        $scope.queues = data.aaData;
        $scope.queue = $scope.queues[0].id;
      }
      $scope.init();
    });
  });

  $scope.myCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    if (!$(nRow).hasClass("hoverable")) { // only do if we haven't done it yet.
      $(nRow).addClass("hoverable");
      $(nRow).addClass("tableRow");
      $(nRow).attr("data-id", iDisplayIndexFull);

      var currSources = aData.units[0].sources;
      // here we are going to dynamically add sources
      if (currSources.length > 0) {
        if ($('td:eq(1)', nRow).html() != "") {
          var sources_div = "";
          for (var i = 0; i < currSources.length; i++) {
            sources_div = sources_div +
              "<div><a href='#/case/" + currSources[i].case_id + "/source/" + currSources[i].id + "' target='_blank'>" + currSources[i].attachment_file_name + "</a></div>";
          }
          $('td:eq(1)', nRow).html($compile(sources_div)($scope));
        }
      }

      $('td:eq(5)', nRow).html(""); // should be empty unless we load it with assign to people
      // NOTE: Using $compile isn't a good thing.  Since I need to add this dynamically to the DOM angular must recognize the
      // ng-click function.  A better way is to make this part of the directive.
      // Add buttons for actions
      if ($('td:eq(4)', nRow).html() != "") {
        var actions = $('td:eq(4)', nRow).html().split(",");
        var buttons = "";
        for (var i = 0; i < actions.length; i++) {
          buttons = buttons +
            "<div ng-click='processTask(" + aData.id + ",\"" + actions[i] + "\", \"" + $(nRow).attr("data-id") + "\")' class='btn btn-flat btn-mini btn-info custom-button-style capitalize' title='View user information'></i>" + actions[i].replace(/_/g, ' ') + "</div>";

        }
        buttons = buttons +
            "<br /><div>&nbsp;</div><div ng-click='unitizationTask(" + aData.id + ")' class='btn btn-flat btn-mini btn-info custom-button-style capitalize' title='Unitization'></i>Unitization</div>";
        var buttonsHTML = $compile(buttons)($scope);
        $('td:eq(4)', nRow).html(buttonsHTML);
        if (actions.indexOf('assign') > -1) {
          // load assign to people
          var assignUserDiv = "<div><select ng-options='obj.id as obj.full_name for obj in users' ng-model='assignToUser" + nRow.getAttribute('data-id') + "'>" +
            "<option style='display:none' value=''>Select one...</option>" +
            "</select></div>";
          $('td:eq(5)', nRow).html($compile(assignUserDiv)($scope));
        }
      }

      $('td:eq(0)', nRow).bind('click', function () {
        var self = this;
        $scope.$apply(function () {
          $scope.expandTask(aData);
        });
      });
    }
    return nRow;
  };

  $scope.expandTask = function (data) {
    window.open("/#/case/" + data.units[0].sources[0].case_id + "/source/" + data.units[0].sources[0].id);
  }

  $scope.processTask = function (id, event, dataRowId) {
    $scope.task = {"event": event, "user_id": $scope.$eval("assignToUser" + dataRowId)}; // assignToUser when filled in represents the user_id.
    $http.put('tasks/' + id + '.json', $scope.task).
      success(function (data) {
        $scope.tasks = []; // null out to refresh
        $scope.init();
        $rootScope.$broadcast('successMessageUpdated', "Task processed.");
      });
  };

  $scope.unitizationTask = function (id) {
    window.unitizationTask(id);
    setTimeout(function(){
      $(".myWork li[heading=Unitization]").find("a").trigger("click");
    });
  }

  $scope.columnDefs = [
    { "mDataProp": "id", "aTargets": [0], "bVisible": false},
    { "mDataProp": "current_state", "aTargets": [1],
      "mRender": function (data, type, full) {
        return data.replace(/_/g, ' ');
      }, "sClass": "capitalize"},
    { "mDataProp": "units", "aTargets": [2], "bVisible": true},
    // used as a load position for documents/sources
    { "mDataProp": "assigned_user_name", "aTargets": [3]},
    { "mDataProp": "updated_at", "aTargets": [4],
      "mRender": function (data, type, full) {
        var cDate = new Date(data);
        return cDate.toLocaleDateString() + " " + cDate.toLocaleTimeString();
      } },
    { "mDataProp": "events", "aTargets": [5]},
    { "mDataProp": "id", "aTargets": [6]} // used as a load position for assign_to user
  ];

  $scope.overrideOptions = {
  };

  $scope.selectListBy = function () {
    // when you change the drop down - show my tasks or all then re-init list.
    $scope.init();
  }

  $scope.selectQueue = function () {
    // when you change the drop down - show my tasks or all then re-init list.
    $scope.init();
  }

  $scope.uploadDialogShouldBeOpen = false;

  $scope.openUploadDialog = function () {
    $scope.uploadDialogShouldBeOpen = true;
    $scope.uploadingNow = false;
  };

  $scope.closeUploadDialog = function () {
    $scope.uploadDialogShouldBeOpen = false;
    if ($scope.finishedUpload()) {
      $scope.queue = 3;
      $scope.init();
//      $timeout(function () {
//        $route.reload();
//      }, 0);
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
    if (angular.element(document.getElementById('fileupload')).scope().caseID) {
      var tempFiles = angular.element(document.getElementById('fileupload')).scope().queue, allFilesHaveCategories = true;
      for (var n = 0; n < tempFiles.length; n++) {
        if (!tempFiles[n].category)
          allFilesHaveCategories = false;
      }
      //create new task/unit before uploading
      if (allFilesHaveCategories) {
        $http.post('/tasks.json', $scope.newTask).success(function (data) {
          $scope.uploadingNow = true;
          angular.element(document.getElementById('fileupload')).scope().submit(data.id);
        });
      } else {
        alert('Please enter a category for all files.');
      }
    } else {
      $('#caseName').addClass('caseMissingAlert pulse');
      $('#caseName').bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function (e) {
        $('#caseName').removeClass('pulse');
      });
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

  $scope.init = function () {
    $scope.tasks = [];
    $http.get('/tasks.json', { tracker: 'ajaxCall', params: {listBy: $scope.listBy, queue: $scope.queue}}).success(function (data) {
      var cleanTasks = [];
      for(var n=0; n<data.length; n++) {
        if(data[n].units[0].sources.length != 0) {
          cleanTasks.push(data[n]);
        }
      }
      $scope.tasks = cleanTasks;
    });

    // get users for assign to list- TODOAF should be cached.
    $http.get('/users.json', { tracker: 'ajaxCall' }).success(function (data) {
      $scope.users = data;
    });

  }

//  $scope.init();
}]);
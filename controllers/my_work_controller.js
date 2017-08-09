laiApp.controller('MyWorkCtrl',['$scope', '$http', function ($scope, $http, $event) {

  $scope.pdf_files = [];
  $scope.page_thumbnails = [];
  $scope.file_id;
  $scope.task_id;



  $scope.panes = [
    { title:"Performance", page:"ops_monitor_canvas"},
    { title:"Work Q", page:"work_q_list" },
    { title:"Unitization", page:"unitization_list" },
    { title:"Coding", page:"coding_list" },
    { title:"File Import", page:"work_q_import_list"},
    { title:"Admin", page:"admin_list" }
  ];

  // $http.get('/unitizations.json').success(function (data) {
    // we have the results now get it into the format for datatables and remove poid and ctid from showing.
  //   if (data.length != 0){
  //     $scope.pdf_files = data;
  //     $scope.file_id = $scope.pdf_files[0]['id'];
  //   }
  // });

  $scope.unitizationTask = function(task_id){
    $scope.task_id = task_id;
    var url = '/unitizations.json?task_id=' + task_id;
    $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
      $scope.pdf_files = data;
      var contain = '<section ng-include src="' + '/assets/unitization_file_list.html' + '"></section>';
      $('pdf_file_list').html(contain);
    });
  }

  window.unitizationTask = $scope.unitizationTask;

  $scope.pdfPreview = function(pdf) {
    $scope.file_id = pdf.pdf_file.id;
    pdfPreview($scope.file_id);

    $http.get('/unitizations/'+ $scope.file_id +'/thumbnails.json').success(function (data) {
      $scope.page_thumbnails = data;
      var contain = '<section ng-include src="' + '/assets/unitization_thumbnail.html' + '"></section>';
      $('thumbnail-page-list').html(contain);
    });
  }

  $scope.moveFile = function(){
    var page_number = $('#move_page_no').val();
    var new_location = $('#move_new_location').val();
    if (page_number != '' && new_location != ''){ 
      var url = '/unitizations/' + $scope.file_id + '/move.json?page_number='+ page_number + '&new_location=' + new_location;
      $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
        $scope.page_thumbnails = data;
        var contain = '<section ng-include src="' + '/assets/unitization_thumbnail.html' + '"></section>';
        $('thumbnail-page-list').html(contain);
        pdfPreview($scope.file_id);
      });
    }
  }

  $scope.splitFile = function(){
    var to = $('#split_to').val();
    var from = $('#split_from').val();
    if (to != '' && from != ''){
      var url = '/unitizations/'+ $scope.file_id +'/split.json?to=' + to + '&from=' + from;
      $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
        $scope.pdf_files = data;
        var contain = '<section ng-include src="' + '/assets/unitization_file_list.html' + '"></section>';
        // $('pdf_file_list').html(contain);
        unitizationTask($scope.task_id);
      });
    }
  }

  $scope.renamePdfFile = function(){
    var selected = countSelectedFile();
    if (selected.length == 1 ){
      var file_name = window.prompt("File Name","");
      while(file_name == ''){
        file_name = window.prompt('File Name', '');
      }
      if (file_name != null){
        var url = '/unitizations/'+ selected[0] + '/rename.json?file_name=' + file_name + '&task_id=' + $scope.task_id;
        $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
          $scope.pdf_files = data;
          var contain = '<section ng-include src="' + '/assets/unitization_file_list.html' + '"></section>';
          $('pdf_file_list').html(contain);
        });
      }
    } else {
      alert('Please select only 1 files for Rename operation.');
    }
  }

  $scope.duplicatePdfFile = function(){
    var selected = countSelectedFile();
    if (selected.length == 1 ){
      var url = '/unitizations/'+ selected[0] + '/duplicate.json?task_id=' + $scope.task_id;
      $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
        $scope.pdf_files = data;
        var contain = '<section ng-include src="' + '/assets/unitization_file_list.html' + '"></section>';
        $('pdf_file_list').html(contain);
      });
    } else {
      alert('Please select only 1 files for Duplicate operation.');
    }
  }

  $scope.mergePdfFile = function(){
    var selected = countSelectedFile();
    if (selected.length >= 2 ){
      var file_name = window.prompt("File Name","");
      if (file_name != null){
        var url = '/unitizations/merge.json?file_ids=' + selected + '&file_name=' + file_name + '&task_id=' + $scope.task_id;
        $http.get(url, {tracker:'ajaxCall'}).success(function (data) {
          $scope.pdf_files = data;
          var contain = '<section ng-include src="' + '/assets/unitization_file_list.html' + '"></section>';
          $('pdf_file_list').html(contain);
        });
      }
    } else {
      alert('Please select the atleat 2 files.');
    }
  }

  $scope.pane = $scope.panes[0].active = true

}]);
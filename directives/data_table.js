angular.module('laiApp').directive('myTable', function () {
  return function (scope, element, attrs) {

    // apply DataTable options, use defaults if none specified by user
    var options = {};
    if (attrs.myTable.length > 0) {
      options = scope.$eval(attrs.myTable);
    } else {
      options = {
        "bDestroy":true,
        "bPaginate":true,
        "bDeferRender":true,
        "bServerSide":false,
        "bSort":false,
        "sPaginationType":"full_numbers",
        "bAutoWidth":false // TODOAF - maybe fix? NEEDED since otherwise on tabs which aren't initially show but have datatables the sizing is all wrong. Real way is to call fnAdjustColumSizing() after tab is show, but not obvious with angular.
      };
    }

    // Tell the dataTables plugin what columns to use
    // We can either derive them from the dom, or use setup from the controller
    var explicitColumns = [];
    element.find('th').each(function (index, elem) {
      explicitColumns.push($(elem).text());
    });
    if (explicitColumns.length > 0) {
      options["aoColumns"] = explicitColumns;
    } else if (attrs.aoColumns) {
      options["aoColumns"] = scope.$eval(attrs.aoColumns);
    }

    // aoColumnDefs is dataTables way of providing fine control over column config
    if (attrs.aoColumnDefs) {
      options["aoColumnDefs"] = scope.$eval(attrs.aoColumnDefs);
    }

    if (attrs.fnRowCallback) {
      options["fnRowCallback"] = scope.$eval(attrs.fnRowCallback);
    }

    // apply the plugin
    var dataTable;

    if (options["aoColumns"] && options["aoColumnDefs"]) {
      // if columns are defined create datatable
      dataTable = element.dataTable(options);
    }

    scope.$watch(attrs.aoColumns, function (value) {
      // when updating a dynamic list of column headers
      if (value) {
        options["aoColumns"] = value;
      }
    });

    scope.$watch(attrs.aoColumnDefs, function (value) {
      // when updating a dynamic list of column defs
      if (value) {
        options["aoColumnDefs"] = value;
      }
    });

    scope.$watch(attrs.initDataTable, function (value) {
      // when delaying init until all data is loaded
      if (value) {
        dataTable = element.dataTable(options);
      }
    });

    // watch for any changes to our data, rebuild the DataTable
    scope.$watch(attrs.aaData + ".length", function (value) {
      if (value !== 'undefined' && dataTable && !options["bServerSide"]) {
        dataTable.fnClearTable();
        dataTable.fnAddData(scope.$eval(attrs.aaData));
      }
    });
  };
});

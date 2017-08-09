/* Please do not define the directive as following:
 * laiApp.directive('analyticschart',function($http){}); 
 * rather use following syntax:
 * laiApp.directive('rgraph',['$http', function ($http){}]); 
 *
 * This is important because when we precompile/minify the assets, the parameter names on the function are
 * renamed and may cause "Undefined Variable" issue at run time, The recommended approach is to exclusively define
 * parameters names in the array so they do not get overwritten.
 */
laiApp.directive('laiChart', ['$http', '$compile', function ($http, $compile) {
  return {
    restrict: 'E',
    scope: 'isolate',
    templateUrl: 'assets/lai_chart_template.html',
    link: function (scope, element, attrs) {

      scope.chartDivId = attrs.chartDivId;
      scope.chartLayoutId = attrs.chartLayoutId;
      scope.chartClass = attrs.chartClass;
      scope.element = element;
      scope.showEditBoxes = false;

      // init section
      // init dates
      scope.dateTo = new Date();
      var oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getUTCFullYear() - 1)
      scope.dateFrom = oneYearAgo;

      //scope.lockOrUnlock(true); // init lock icon

      scope.quarters = ['1st Qtr', '2nd Qtr', '3rd Qtr', '4th Qtr'];
      var currentYear = new Date().getFullYear();
      scope.years = ['All'];
      for (var i = currentYear; i >= (currentYear - 10); i--) {
        scope.years.push(i);
      }
      scope.$watch("chartType", function (value) {
        if (value == '3') {
          if (!scope.vendors) {
            //lazy load vendors
            $http.get('/summary_costs.json').success(function (data) {
              scope.vendors = data;
              scope.vendorName = scope.vendors[0];
            });
          }
        } else if (value == '5') {
          if (!scope.cases) {
            //lazy load cases
            $http.get('/search.json?category_name[]=Financial').success(function (data) {
              var casesArray = new Array();
              for (var i = 0; i < data.case_name_facets.length; i++) {
                casesArray.push(data.case_name_facets[i].value);
              }
              casesArray.sort();
              casesArray.push("ALL");
              scope.cases = casesArray;
              scope.case1Name = casesArray[0];
              scope.case2Name = casesArray[0];
            });
          }
        }
      });
      scope.quarter1 = scope.quarters[0];
      scope.quarter2 = scope.quarters[0];
      scope.selectedYear1 = scope.years[0];
      scope.selectedYear2 = scope.years[0];
      scope.chartSelected = false;

      // TODOAF can't figure out how to do this better with isolated scope!
      scope.setVendorName = function (value) {
        scope.vendorName = value;
      }
      scope.setCase1Name = function (value) {
        scope.case1Name = value;
      }
      scope.setCase2Name = function (value) {
        scope.case2Name = value;
      }
      scope.setQuarter1 = function (value) {
        scope.quarter1 = value;
      }
      scope.setQuarter2 = function (value) {
        scope.quarter2 = value;
      }
      scope.setSelectedYear1 = function (value) {
        scope.selectedYear1 = value;
      }
      scope.setSelectedYear2 = function (value) {
        scope.selectedYear2 = value;
      }

      scope.setForNone = function (event) {
        // handle case where "None" is selected
        var srcElement = event.target || event.srcElement;
        var chartDisplayType = $.trim($(srcElement).text());
        if (chartDisplayType == "None") {
          scope.chartSelected = false;
          $('#' + attrs.chartDivId).empty();
          scope.$parent.saveChart({"id": scope.chartDivId, "layoutId": scope.chartLayoutId}); // empty chart
        }
      }

      scope.$on("clearChart", function (event) {
        scope.chartSelected = false;
        $("#" + scope.id).html(""); // clear out actual chart
      });

      scope.$on("loadChart", function (event, curr_section) {
        if (curr_section.id == scope.chartDivId /*&& curr_section.layoutId == scope.chartLayoutId*/) {
          if (curr_section.type) { // otherwise empty chart
            scope.chartDisplayType = curr_section.type;
            scope.chartTypeID = curr_section.ctid;
            scope.id = curr_section.id;
            if (curr_section.data_control_type == 1) {
              // date range
              scope.dateTo = new Date(curr_section.data.dateTo);
              scope.dateFrom = new Date(curr_section.data.dateFrom);
            } else if (curr_section.data_control_type == 2) {
              scope.quarter1 = curr_section.data.quarter1;
              scope.quarter2 = curr_section.data.quarter2;
              scope.selectedYear1 = curr_section.data.selectedYear1;
              scope.selectedYear2 = curr_section.data.selectedYear2;
            } else if (curr_section.data_control_type == 3) {
              scope.vendorName = curr_section.data.vendorName;
            } else if (curr_section.data_control_type == 5) {
              scope.case1Name = curr_section.data.case1Name;
              scope.case2Name = curr_section.data.case2Name;
            }
            scope.getChart();
          }
        }
      });

      // display chart and date buttons
      scope.getChart = function (event, parent) {
        if (event) { // then we must pull these values otherwise we are called directly from a method
          var srcElement = event.target || event.srcElement;
          var chartDisplayType = $(srcElement).text(); // e.g., Bar 2D
          var chartTypeID = parent.chartType.id;
          scope.chartDisplayType = chartDisplayType;
          scope.chartTypeID = chartTypeID;
          scope.id = attrs.chartDivId;
        }
        scope.dateFromAsString = (scope.dateFrom.getMonth() + 1) + "/" + scope.dateFrom.getDate() + "/" + scope.dateFrom.getFullYear();
        scope.dateToAsString = (scope.dateTo.getMonth() + 1) + "/" + scope.dateTo.getDate() + "/" + scope.dateTo.getFullYear();
        $http.get('chart_types/' + scope.chartTypeID + '.json?type=' + scope.chartDisplayType + '&dateFrom=' + scope.dateFromAsString + '&dateTo=' + scope.dateToAsString +
            '&vendorName=' + scope.vendorName + '&case1Name=' + scope.case1Name + '&case2Name=' + scope.case2Name + '&selectedYear1=' + scope.selectedYear1 + '&quarter1=' +
            scope.quarter1.charAt(0) + '&selectedYear2=' + scope.selectedYear2 + '&quarter2=' + scope.quarter2.charAt(0)).success(function (data) {

            if (!data.chartData) return; // nothing came back
            scope.chartSelected = true;
            scope.chartName = data.chartData.name;
            scope.chartCategory = data.chartData.category;
            scope.chartType = data.chartData.chart_type; // 1 date range; 2 quarter range

            scope.chartData =
            {"id": scope.chartDivId, "clientId": data.chartData.current_client_id, "layoutId": scope.chartLayoutId, "ctid": scope.chartTypeID, "type": scope.chartDisplayType,
              "data": {"dateTo": scope.dateToAsString, "dateFrom": scope.dateFromAsString,
                "vendorName": scope.vendorName,
                "case1Name": scope.case1Name,
                "case2Name": scope.case2Name,
                "quarter1": scope.quarter1, "quarter2": scope.quarter2,
                "selectedYear1": scope.selectedYear1,
                "selectedYear2": scope.selectedYear2},
              "data_control_type": scope.chartType,
              "coordinates": {"left": scope.element[0].style.left,
                "top": scope.element[0].style.top,
                "width": scope.element[0].style.width,
                "height": scope.element[0].style.height}
            };
            scope.$parent.saveChart(scope.chartData);
            var fchart = $("#" + scope.id);

            setTimeout(function () {
              var h, w;
              var fchartParent = $('[chart-div-id=' + scope.id + ']');
              var datepickerdiv = fchartParent.find('.section-occupied');
              var realHeight = datepickerdiv.innerHeight();
              w = fchart.innerWidth()
              h = $('lai-chart[chart-div-id=' + scope.id + ']').height() - 20 - realHeight;

//            h = (scope.chartClass.indexOf("half") !== -1) ? w / 2 : w;
              scope.chartID = "fchartx" + new Date().getTime().toString();

              fchart.insertFusionCharts({
                swfUrl: data.chartData.chart_file,
                dataSource: data.chartData,
                dataFormat: "json",
                width: w,
                height: h,
                id: scope.chartID
              });
            }, 0);

            var divText;

            fchart.drillDownFusionChartsTo
            ({ swfUrl: data.chartData.linked_chart_file });
            fchart.bind("fusionchartsdataloadrequested", function (e, args) {
              // special case where we have a url param called secondarycharts which triggers additional charts
              if (args.url && args.url.indexOf("secondarycharts=") != -1) { // secondary charts show up below

                var myWindow = window.open('', '', 'width=800,height=500');
                var doc = myWindow.document;

                doc.open();
                //doc.write(document.getElementById(scope.id).outerHTML);
                // quick way to get ids of all secondary charts
                var ids = args.url.split("[")[1].split("]")[0].split(",");
                for (var i = 0; i < ids.length; i++) {
                  $http.get('/chart_types/' + ids[i] + '.json?' + args.url.split("level=3&")[1], {"params": i}).success(function (data, status, headers, config) {
                    if (!data.chartData) return; // nothing came back
                    var fcharta = $("#" + scope.id + "_" + config.params);
                    fcharta.css({display: 'block'});
                    var h, w;
                    fcharta.insertFusionCharts({
                      swfUrl: data.chartData.chart_file,
                      // remove level and parse secondarycharts ids
                      dataSource: data.chartData,
                      dataFormat: "json",
                      width: '100%',
                      height: '100%',
                      id: "fchartx" + config.params + new Date().getTime().toString()
                    });
                    fcharta.css("float", "left");
                    var idname = scope.id + "_" + config.params;
                    doc.write(document.getElementById(idname).outerHTML);
                    fcharta.css({display: 'none'});
                  });
                }
              }
            });
            return;
          });
      }

      scope.deleteChart = function () {
        scope.$parent.deleteChart({"id": scope.chartDivId, "layoutId": scope.chartLayoutId});
      }


      scope.$parent.updateChartSize(scope.chartDivId);

      $('.dropdown-menu li a').live('mouseover', function (e) {
        e.stopPropagation();
        $(this).parent().parent().find('li').each(function () {
          $(this).removeClass('open');
        });
        $(this).parent().addClass('open');
      });

      $('.dropdown-menu li a').live('click', function (e) {
        $(this).parent().parent().parent().parent().parent().parent().find('li').each(function () {
          $(this).removeClass('open');
        });
      });
    }
  };
}]);



/*
 * Define services as:
 * angular.module('<app name>').service('<service name>',[<comma separated name strings of params>, function(<paramters list>){}])
*/
var myModule = angular.module('laiApp').service("SearchService",['$http', function($http) {
  var search_bar_query = {
    'q':'', 'case_name':[], 'category_name':[],
    'dynamic_attribute':{}, 'dynamic_date_range':{}, 'dynamic_facet':[],
    'current_page':1, 'number_per_page':50, 'exclude_filters':false
  };

  var report_data = {
    'name':null,
    'format_id':0,
    'location':'myReports',
    'criteria':{
      'q':'',
      'cases':[],
      'categories':[],
      'other_facets':[],
      'date_ranges':[],
      'current_page':1,
      'number_per_page':50

    },
    'facets':[],
    'columns':[],
    'share':'private',
    'groups':[]
  };

  return {
    // We are allowing the query to use to be passed from page to page. This is to workaround
    // the lack of support for passing multiple parameters with the same name (i.e. arrays) using
    // the $location.search mechanism.
    // https://github.com/angular/angular.js/issues/750
    getSearchBarQuery:function () {
      return search_bar_query;
    },
    setSearchBarQuery:function (query) {
      search_bar_query = query;
    },
    getReportData:function () {
      return report_data;
    },
    setReportData:function (data) {
      report_data = data;
    },
    buildQuery:function (q, category_name, case_name, dynamic_attribute, dynamic_date_range, dynamic_facet, current_page, number_per_page, exclude_filters) {
      var service_query = {};
      service_query.q = q;
      service_query.category_name = category_name;
      service_query.case_name = case_name;
      service_query.dynamic_attribute = dynamic_attribute;
      service_query.dynamic_date_range = dynamic_date_range;
      service_query.dynamic_facet = dynamic_facet;
      service_query.current_page = current_page;
      service_query.number_per_page = number_per_page;
      service_query.exclude_filters = exclude_filters;
      return service_query;
    },
    search:function (service_query) {
      /*
       var url = 'search.json?q=' + encodeURIComponent(service_query.q);

       url += '&current_page=' + service_query.current_page;
       url += '&number_per_page=' + service_query.number_per_page;
       url += '&exclude_filters=' + service_query.exclude_filters;

       for (var i = 0; i < service_query.category_name.length; i++) {
       url += '&category_name';
       url += encodeURIComponent('[]');
       url += '=';
       url += encodeURIComponent(service_query.category_name[i]);
       }

       for (var i = 0; i < service_query.case_name.length; i++) {
       url += '&case_name';
       url += encodeURIComponent('[]');
       url += '=';
       url += encodeURIComponent(service_query.case_name[i]);
       }

       for (facet_name in service_query.dynamic_attribute) {
       if (service_query.dynamic_attribute.hasOwnProperty(facet_name)) {
       for (var i = 0; i < service_query.dynamic_attribute[facet_name].length; i++) {
       url += '&dynamic_attribute';
       url += encodeURIComponent('[');
       url += facet_name;
       url += encodeURIComponent(']');
       url += encodeURIComponent('[]');
       url += '=';
       url += encodeURIComponent(service_query.dynamic_attribute[facet_name][i]);
       }
       }
       }

       for (var j = 0; j < service_query.dynamic_facet.length; j++) {
       url += '&dynamic_facet';
       url += encodeURIComponent('[]');
       url += '=';
       url += encodeURIComponent(service_query.dynamic_facet[j]);
       }

       for (facet_name in service_query.dynamic_date_range) {
       if (service_query.dynamic_date_range.hasOwnProperty(facet_name)) {
       var dates = service_query.dynamic_date_range[facet_name];
       var from = dates['start'];
       var fromStr = from.getFullYear() + '-' + (1 + from.getMonth()) + '-' + from.getDate();
       var to = dates['end'];
       var toStr = to.getFullYear() + '-' + (1 + to.getMonth()) + '-' + to.getDate();

       url += '&dynamic_date_range';
       url += encodeURIComponent('[');
       url += facet_name;
       url += encodeURIComponent(']');
       url += encodeURIComponent('[');
       url += 'start';
       url += encodeURIComponent(']');
       url += '=';
       url += fromStr;

       url += '&dynamic_date_range';
       url += encodeURIComponent('[');
       url += facet_name;
       url += encodeURIComponent(']');
       url += encodeURIComponent('[');
       url += 'end';
       url += encodeURIComponent(']');
       url += '=';
       url += toStr;
       }
       }
       var promise = $http.get(url,{ tracker: 'ajaxCall' }).then(function(response) {
       return response.data;
       });
       */

      var promise = $http.post('search.json', service_query, {tracker:'ajaxCall'}).then(function (response) {
        return response.data;
      });

      return promise;
    }
  };
}]);

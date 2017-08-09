function getPendingChartClickData(facet_value, facet_name, display_name) {
  angular.element(document.getElementById('pendingCasesCtrl')).scope().updateCaseInfoTable(facet_value, facet_name, display_name);
}

function verdictByAttributeClicked(outcome_facet_name, outcome_facet_display_name, outcome_value, facet_name, facet_value) {
  angular.element(document.getElementById('pendingCasesCtrl')).scope().updateTable(outcome_facet_name, outcome_facet_display_name, outcome_value, facet_name, facet_value);
}

laiApp.controller('PendingCasesCtrl',["$scope", "$http", "$q", "$modal", "SearchService", function ($scope, $http, $q, $modal, SearchService) {
  // The list of outcome values to use when querying for cases with outcomes.
  $scope.outcome_values = [
    'Actual damages only',
    'Actuals and punitives',
    'Appeal - Affirmed',
    'Appeal - Denied',
    'Appeal - Reversed',
    'Appeal - Voluntary Dismissal',
    'Dismissed with Prejudice',
    'Dismissal with Prejudice',
    'Dismissed with Prejudice',
    'Dismissed without Prejudice',
    'Dismissed-Voluntary/Severed',
    'Dropped in Amended Complaint',
    'Involuntary Dismissal',
    'Liability but no damages',
    'Mistrial',
    'Settled',
    'Settled during Trial',
    'Settled-Offer of Judgment',
    'Statute of limitations',
    'Stipulated Dismissal',
    'Summary Judgment-Defendant',
    'Trial Verdict Defendant',
    'Trial Verdict Plaintiff',
    'Voluntary Dismissal',
    'Voluntary dismissal'
  ];

  // The list of outcome facets by client.
  $scope.outcome_facets = [
    {'display_name':'Industry', 'name':'0_ind_outcome', 'facet_display_name':'Ind Outcome'},
    {'display_name':'BWGroup', 'name':'0_bwgroup_outcome', 'facet_display_name':'Bwgroup Outcome'},
    {'display_name':'Lori', 'name':'0_lori_outcome', 'facet_display_name':'Lori Outcome'},
    {'display_name':'Ltc', 'name':'0_ltc_outcome', 'facet_display_name':'Ltc Outcome'},
    {'display_name':'Pmusa', 'name':'0_pmusa_outcome', 'facet_display_name':'Pmusa Outcome'},
    {'display_name':'Rjrt', 'name':'0_rjrt_outcome', 'facet_display_name':'Rjrt Outcome'}
  ];

  // The list of status facets by client.
  $scope.status_facets = [
    {'name':'0_ind_case_status', 'display_name':'Ind Case Status'},
    {'name':'0_bwgroup_case_status', 'display_name':'Bwgroup Case Status'},
    {'name':'0_lori_case_status', 'display_name':'Lori Case Status'},
    {'name':'0_ltc_case_status', 'display_name':'Ltc Case Status'},
    {'name':'0_pmusa_case_status', 'display_name':'Pmusa Case Status'},
    {'name':'0_rjrt_case_status', 'display_name':'Rjrt Case Status'}
  ];

  // The list of all cases with outcomes.
  $scope.cases_with_outcomes = [];

  // The list of all pending cases.
  $scope.pending_cases = [];

  // A hash of case names to case units by year.
  $scope.case_units_by_year = {};

  // The pending case being used for analysis.
  $scope.pending_case = {};

  // A filter for the cases with outcomes.
  $scope.cases_with_outcomes_filter = null;

  // A filter for the pending cases.
  $scope.pending_case_filter = null;

  // A boolean to show/hide facet filters.
  $scope.show_facet_filters = false;

  // A list of facets used to filter the results.
  $scope.facet_filters = [
    {'display_name':'Judge Full Name', 'name':'0_judge_full_name', 'values':[]},
    {'display_name':'Disease Codes', 'name':'0_disease_codes', 'values':[]},
    {'display_name':'Ethnicity Of Smoker', 'name':'0_ethnicity_of_smoker', 'values':[]},
    {'display_name':'Counsel Plaintiff', 'name':'0_counsel_plaintiff', 'values':[]},
    {'display_name':'Trial Counsel', 'name':'0_trial_counsel', 'values':[]}
  ];

  // The category type (Industry, Rjrt, Pmusa, etc.) being analyzed.
  $scope.selected_outcome_facet = $scope.outcome_facets[0];

  // An indicator of whether there is chart data for the currently selected category.
  $scope.has_outcome_chart_data = false;

  // Outcome counts for the currently selected category.
  $scope.outcome_chart_data = {};

  // The category type (Industry, Rjrt, Pmusa, etc.) being analyzed by attribute.
  $scope.selected_outcome_attribute_facet = $scope.outcome_facets[0];

  // A list of attributes to use to generate the verdict by attribute chart.
  $scope.chart_attributes = [];

  // Verdicts by attribute data for the currently selected category.
  $scope.verdicts_by_attribute_chart_data = {};

  // An indicator of whether there is verdicts by attribute chart data for the currently
  // selected category.
  $scope.has_verdicts_by_attribute_chart_data = false;

  // A list of information about selected cases.
  $scope.case_info = [];

  // The text to display above the case info.
  $scope.case_info_title = null;

  // An indicator of whether case info should be shown.
  $scope.show_case_info = false;

  // Filters data in the case info table.
  $scope.case_info_filter = '';

  $scope.loadCasesWithOutcomes = function () {
    var promises = [];
    for (var i = 0; i < $scope.outcome_facets.length; i++) {
      var facet_name = $scope.outcome_facets[i].name;
      var dynamic_attribute = {};
      dynamic_attribute[facet_name] = $scope.outcome_values;
      var query = SearchService.buildQuery(
          '', // query
          ['Case Profile'], // category names
          [], // case names
          dynamic_attribute,
          {}, // dynamic date ranges
          [], // dynamic facets
          1, // page number
          0, // 0 means do not return hits
          false);

      promises.push(SearchService.search(query));
    }

    var cases_with_outcomes = [];
    $q.all(promises).then(function (results) {
      for (i = 0; i < results.length; i++) {
        var query_results = results[i];
        for (var j = 0; j < query_results.case_name_facets.length; j++) {
          var case_name = query_results.case_name_facets[j].value;
          if (!$scope.caseNameExists(case_name, cases_with_outcomes)) {
            cases_with_outcomes.push({'name':case_name, 'is_selected':false});
          }
        }
      }

      angular.copy(cases_with_outcomes, $scope.cases_with_outcomes);
    });
  };

  $scope.loadPendingCases = function () {
    var promises = [];
    for (var i = 0; i < $scope.status_facets.length; i++) {
      var category_name = [];
      category_name.push('Case Profile');

      var facet_name = $scope.status_facets[i].name;
      var dynamic_attribute = {};
      dynamic_attribute[facet_name] = ['Pending'];

      var dynamic_facets = $scope.getDynamicFacets();

      var query = SearchService.buildQuery(
          '', // query
          category_name, // category names
          [], // case names
          dynamic_attribute,
          {}, // dynamic date ranges
          dynamic_facets, // dynamic facets
          1, // page number
          1000, // number of sources to return
          false);

      promises.push(SearchService.search(query));
    }

    var pending_cases = [];
    $q.all(promises).then(function (results) {
      for (i = 0; i < results.length; i++) {
        var query_results = results[i];
        for (var j = 0; j < query_results.case_name_facets.length; j++) {
          var case_name = query_results.case_name_facets[j].value;
          if (!$scope.caseNameExists(case_name, pending_cases)) {
            var case_hits = query_results.hits[case_name];
            // It is possible that there are multiple sources for a case. This is because
            // the 'Pending Case' import files were treated as case profiles. We are going
            // to iterate over the case hits and ignore the pending case sources.
            if (angular.isDefined(case_hits)) {
              for (var k = 0; k < case_hits.length; k++) {
                var case_hit = case_hits[k];
                // Only continue if this hit is not a pending case.
                if (case_hit.file_name.indexOf('Pending_Cases') == -1) {
                  var attribute_values = case_hit.dynamic_attribute_values;
                  pending_cases.push({'name':case_name, 'attribute_values':attribute_values});
                }
              }
            }
          }
        }
      }

      angular.copy(pending_cases, $scope.pending_cases);
    });
  };

  // Loads case name units by year data.
  $scope.loadCostsByCaseName = function () {
    $http.get('/summary_costs/case_units_by_year.json').success(function (data) {
      angular.copy(data, $scope.case_units_by_year);
    });
  };

  // Check whether the supplied case name already exists in the list of cases.
  $scope.caseNameExists = function (name, cases) {
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].name === name) {
        return true;
      }
    }

    return false;
  };

  // Select all cases based upon the value of the supplied parameter.
  $scope.selectAllCases = function (checked) {
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      $scope.cases_with_outcomes[i].is_selected = checked;
    }
  };

  // Select all facet values based upon the value of the supplied parameter.
  $scope.selectAllFacets = function (facet, checked) {
    for (var i = 0; i < facet.values.length; i++) {
      facet.values[i].is_selected = checked;
    }
  };

  // Select all facet values which appear in the supplied pending case.
  $scope.selectMatchedFacets = function (facet, pending_case) {
    // Unselect all facet values first.
    $scope.selectAllFacets(facet, false);

    var values = pending_case.attribute_values[facet.name];
    if (angular.isDefined(values) && values != null) {
      for (var i = 0; i < values.length; i++) {
        for (var j = 0; j < facet.values.length; j++) {
          if (values[i] === facet.values[j].value) {
            facet.values[j].is_selected = true;
            break;
          }
        }
      }
    }
  };

  // Sets the pending case to use for analysis.
  $scope.setPendingCase = function (pending_case) {
    angular.copy(pending_case, $scope.pending_case);
  };

  // Constructs a list of dynamic facets to use when querying. This will prevent
  // all facets from being returned when querying.
  $scope.getDynamicFacets = function () {
    var dynamic_facets = [];
    for (var i = 0; i < $scope.facet_filters.length; i++) {
      dynamic_facets.push($scope.facet_filters[i].name);
    }

    for (i = 0; i < $scope.outcome_facets.length; i++) {
      dynamic_facets.push($scope.outcome_facets[i].name);
    }

    return dynamic_facets;
  };

  // Determines whether the supplied case has the supplied value for the specified facet name.
  $scope.hasFacetValue = function (facet_name, facet_value, pending_case) {
    var values = pending_case.attribute_values[facet_name];
    if (angular.isDefined(values)) {
      for (var i = 0; i < values.length; i++) {
        if (values[i] === facet_value) {
          return true;
        }
      }
    }

    return false;
  };

  // Determines whether the supplied facet filter includes the specified facet value in its
  // filter conditions.
  $scope.isFacetValueSelected = function (facet_value, facet_filter) {
    var values = facet_filter.values;
    if (angular.isDefined(values)) {
      for (var i = 0; i < values.length; i++) {
        if (values[i].value === facet_value) {
          return values[i].is_selected;
        }
      }
    }

    return false;
  };

  $scope.applyCases = function () {
    var showFacetFilters = false;

    if ($scope.pending_case != null && angular.isDefined($scope.pending_case.name)) {
      for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
        if ($scope.cases_with_outcomes[i].is_selected) {
          showFacetFilters = true;
        }
      }
    }

    if (showFacetFilters) {
      var category_name = ['Case Profile'];
      var case_name = [];
      for (i = 0; i < $scope.cases_with_outcomes.length; i++) {
        if ($scope.cases_with_outcomes[i].is_selected) {
          case_name.push($scope.cases_with_outcomes[i].name);
        }
      }

      var dynamic_attribute = {};

      var dynamic_facets = $scope.getDynamicFacets();

      var query = SearchService.buildQuery(
          '', // query
          category_name, // category names
          case_name, // case names
          dynamic_attribute,
          {}, // dynamic date ranges
          dynamic_facets, // dynamic facets
          1, // page number
          1000, // number of sources to return
          true); // exclude filters to include all facet values

      SearchService.search(query).then(function (data) {
        for (i = 0; i < $scope.facet_filters.length; i++) {
          var facet_filter = $scope.facet_filters[i];
          var facet_values = [];
          var values = data.other_facets[facet_filter.display_name];
          if (angular.isDefined(values)) {
            for (var j = 0; j < values.length; j++) {
              facet_values.push({'value':values[j].value, 'count':values[j].count, 'is_selected':false});
            }

            angular.copy(facet_values, facet_filter.values);
          }
        }

        $scope.loadOutcomeChartData($scope.selected_outcome_facet);
        $scope.loadVerdictsByAttributeChartData($scope.selected_outcome_attribute_facet);
      });
    }

    $scope.show_facet_filters = showFacetFilters;
  };

  $scope.applyFacetFilters = function () {
    var category_name = ['Case Profile'];
    var case_name = [];
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      if ($scope.cases_with_outcomes[i].is_selected) {
        case_name.push($scope.cases_with_outcomes[i].name);
      }
    }

    var dynamic_attribute = {};
    for (i = 0; i < $scope.facet_filters.length; i++) {
      var facet_filter = $scope.facet_filters[i];
      dynamic_attribute[facet_filter.name] = [];
      var values = facet_filter.values;
      for (var j = 0; j < values.length; j++) {
        if (values[j].is_selected) {
          dynamic_attribute[facet_filter.name].push(values[j].value);
        }
      }
    }

    var dynamic_facets = $scope.getDynamicFacets();

    var query = SearchService.buildQuery(
        '', // query
        category_name, // category names
        case_name, // case names
        dynamic_attribute,
        {}, // dynamic date ranges
        dynamic_facets, // dynamic facets
        1, // page number
        1000, // number of sources to return
        true); // exclude filters to include all facet values

    SearchService.search(query).then(function (data) {
      for (i = 0; i < $scope.facet_filters.length; i++) {
        var facet_filter = $scope.facet_filters[i];
        var facet_values = [];
        var values = data.other_facets[facet_filter.display_name];
        if (angular.isDefined(values)) {
          for (j = 0; j < values.length; j++) {
            var selected = $scope.isFacetValueSelected(values[j].value, facet_filter);
            facet_values.push({'value':values[j].value, 'count':values[j].count, 'is_selected':selected});
          }

          angular.copy(facet_values, facet_filter.values);
        }
      }

      $scope.loadOutcomeChartData($scope.selected_outcome_facet);
      $scope.loadVerdictsByAttributeChartData($scope.selected_outcome_attribute_facet);
    });
  };

  // Builds the data structure used to render the case outcome chart using the supplied
  // outcome facet.
  $scope.loadOutcomeChartData = function (outcome_facet) {
    var category_name = ['Case Profile'];
    var case_name = [];
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      if ($scope.cases_with_outcomes[i].is_selected) {
        case_name.push($scope.cases_with_outcomes[i].name);
      }
    }

    var dynamic_facets = $scope.getDynamicFacets();

    var dynamic_attribute = {};
    dynamic_attribute[outcome_facet.name] = $scope.outcome_values;
    for (i = 0; i < $scope.facet_filters.length; i++) {
      var facet_filter = $scope.facet_filters[i];
      var facet_values = [];
      var values = facet_filter.values;
      for (var j = 0; j < values.length; j++) {
        if (values[j].is_selected) {
          facet_values.push(values[j].value);
        }
      }

      if (facet_values.length > 0) {
        dynamic_attribute[facet_filter.name] = facet_values;
      }
    }

    var query = SearchService.buildQuery(
        '', // query
        category_name, // category names
        case_name, // case names
        dynamic_attribute,
        {}, // dynamic date ranges
        dynamic_facets, // dynamic facets
        1, // page number
        0, // number of sources to return
        false); // exclude filters to include all facet values

    // Hide the case info since it is no longer accurate.
    $scope.show_case_info = false;

    SearchService.search(query).then(function (data) {
      var display_name = outcome_facet.facet_display_name;
      var facet_values = data.other_facets[display_name];
      var outcome_chart_data = null;
      if (angular.isDefined(facet_values)) {
        var jsonData = [];
        for (var j = 0; j < facet_values.length; j++) {
          jsonData.push({
            'label':facet_values[j].value,
            'value':facet_values[j].count,
            'link':"JavaScript:getPendingChartClickData('" + facet_values[j].value + "', '" + outcome_facet.name + "', '" + outcome_facet.display_name + "');"
          });
        }

        outcome_chart_data = {
          "chart":{
            "showlabels":"0",
            "showvalues":"1",
            "showlegend":"1",
            "legendposition":"bottom",
            "caption":"Case Outcomes",
            "bgcolor":"FFFFFF",
            "bordercolor":"FFFFFF"
          },
          "data":jsonData
        }
      }

      angular.copy(outcome_chart_data, $scope.outcome_chart_data);
      if (outcome_chart_data != null) {
        $scope.has_outcome_chart_data = true;
      } else {
        $scope.has_outcome_chart_data = false;
      }
    });
  };

  // Opens the attribute dialog.
  $scope.openAttributeDialog = function () {
    var modalInstance = $modal.open({
      templateUrl: '/assets/dialogs/pending_cases_dialog.html',
      controller: 'PendingCasesDialogCtrl',
      resolve: {
        chartAttributes: function () {
          return $scope.chart_attributes;
        },
        facetFilters: function () {
          return $scope.facet_filters;
        }
      }
    });

    modalInstance.result.then(function (chartAttributes) {
      $scope.chart_attributes = chartAttributes
      $scope.loadVerdictsByAttributeChartData($scope.selected_outcome_attribute_facet);
    }, function () {
      // Do nothing when the modal is dismissed.
    });
  }

  $scope.loadVerdictsByAttributeChartData = function (outcome_facet) {
    if ($scope.chart_attributes.length > 0) {
      var category_name = ['Case Profile'];
      var case_name = [];
      for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
        if ($scope.cases_with_outcomes[i].is_selected) {
          case_name.push($scope.cases_with_outcomes[i].name);
        }
      }

      var dynamic_facets = $scope.getDynamicFacets();

      // Query once for each chart attribute that was defined using the supplied facet name
      // (e.g. 0_ind_outcome, 0_rjrt_outcome, etc.).
      var promises = [];
      for (i = 0; i < $scope.chart_attributes.length; i++) {
        var facet_name = $scope.chart_attributes[i].facet.name;
        var value = $scope.chart_attributes[i].value;
        var dynamic_attribute = {};
        dynamic_attribute[outcome_facet.name] = $scope.outcome_values;

        // Add all of the selected facet values to the search except for the attribute
        // being used.
        for (var j = 0; j < $scope.facet_filters.length; j++) {
          var facet_filter = $scope.facet_filters[j];
          if (facet_filter.name === facet_name) {
            dynamic_attribute[facet_name] = [value];
          } else {
            var facet_values = [];
            var values = facet_filter.values;
            for (var k = 0; k < values.length; k++) {
              if (values[k].is_selected) {
                facet_values.push(values[k].value);
              }
            }

            if (facet_values.length > 0) {
              dynamic_attribute[facet_filter.name] = facet_values;
            }
          }
        }

        var query = SearchService.buildQuery(
            '', // query
            category_name, // category names
            case_name, // case names
            dynamic_attribute,
            {}, // dynamic date ranges
            dynamic_facets, // dynamic facets
            1, // page number
            0, // number of sources to return
            false); // exclude filters to include all facet values

        promises.push(SearchService.search(query));
      }

      var categories = [];
      var dataset = $scope.initializeVerdictsByAttributeChartDataset();

      // Collect the results into appropriate data structures for the chart.
      $q.all(promises).then(function (results) {
        for (i = 0; i < results.length; i++) {
          // Build the description in the format: 'Facet Display Name: Value'.
          // For example, 'Judge Full Name: Tuter, Jack B.'.
          var display_name = $scope.chart_attributes[i].facet.display_name;
          var value = $scope.chart_attributes[i].value;
          var description = display_name + ': ' + value;
          categories.push({'label':description});

          // Build a list of outcome type counts.
          var query_results = results[i];
          var values = query_results.other_facets[outcome_facet.facet_display_name];
          for (var j = 0; j < dataset.length; j++) {
            var facet_value = dataset[j].seriesname;
            var count = $scope.getFacetValueCount(facet_value, values);
            dataset[j].data.push({
              'value':count,
              'link':'javascript:verdictByAttributeClicked("' +
                  $scope.selected_outcome_attribute_facet.name + '", "'
                  + $scope.selected_outcome_attribute_facet.display_name + '", "'
                  + facet_value + '", "' + $scope.chart_attributes[i].facet.name + '", "' + value + '")'
            });
          }
        }

        var chart_data = {
          'chart':{
            'palette':'2',
            'caption':'Verdicts By Attributes',
            'showlabels':'1',
            'showvalues':'0',
            'showsum':'1',
            'decimals':'0',
            'useroundedges':'1',
            'legendborderalpha':'0',
            'bgcolor':'FFFFFF',
            'bordercolor':'FFFFFF'
          },
          'categories':[
            {
              'category':categories
            }
          ],
          'dataset':dataset
        };

        angular.copy(chart_data, $scope.verdicts_by_attribute_chart_data);

        $scope.has_verdicts_by_attribute_chart_data = true;
      });
    }
  };

  // Initializes a hash of outcome types with 0 counts.
  $scope.initializeVerdictsByAttributeChartDataset = function () {
    var dataset = [];
    for (var i = 0; i < $scope.outcome_values.length; i++) {
      dataset.push({
        'seriesname':$scope.outcome_values[i],
        'showvalues':'0',
        'data':[]
      });
    }

    return dataset;
  };

  $scope.getFacetValueCount = function (facet_value, values) {
    if (angular.isDefined(values)) {
      for (var i = 0; i < values.length; i++) {
        if (values[i].value === facet_value) {
          return values[i].count;
        }
      }
    }

    return 0;
  };

  $scope.updateCaseInfoTable = function (facet_value, facet_name, display_name) {
    var category_name = ['Case Profile'];

    var case_name = [];
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      if ($scope.cases_with_outcomes[i].is_selected) {
        case_name.push($scope.cases_with_outcomes[i].name);
      }
    }

    var dynamic_attribute = {};
    dynamic_attribute[facet_name] = [facet_value];
    for (i = 0; i < $scope.facet_filters.length; i++) {
      var facet_filter = $scope.facet_filters[i];
      var facet_values = [];
      var values = facet_filter.values;
      for (var j = 0; j < values.length; j++) {
        if (values[j].is_selected) {
          facet_values.push(values[j].value);
        }
      }

      if (facet_values.length > 0) {
        dynamic_attribute[facet_filter.name] = facet_values;
      }
    }

    var dynamic_facet = ['3_ind_date_filed', '0_judge_full_name', '0_disease_codes', '0_ethnicity_of_smoker', '0_brands', '0_location'];

    var query = SearchService.buildQuery('',
        category_name,
        case_name,
        dynamic_attribute,
        {}, // dynamic_date_range
        dynamic_facet, // dynamic facets
        1, // page number
        500, // hits per page
        false);

    SearchService.search(query).then(function (data) {
      var case_info = [];
      for (i = 0; i < data.case_name_facets.length; i++) {
        var case_name = data.case_name_facets[i].value;
        var case_hits = data.hits[case_name];
        // It is possible that there are multiple sources for a case. This is because
        // the 'Pending Case' import files were treated as case profiles. We are going
        // to iterate over the case hits and ignore the pending case sources.
        if (angular.isDefined(case_hits)) {
          for (var j = 0; j < case_hits.length; j++) {
            var case_hit = case_hits[j];
            // Only continue if this hit is not a pending case.
            if (case_hit.file_name.indexOf('Pending_Cases') == -1) {
              var case_id = case_hit.case_id;
              var attribute_values = case_hit.dynamic_attribute_values;
              var units = [];
              var case_units = $scope.case_units_by_year[case_name];
              if (angular.isDefined(case_units)) {
                for (var k = 0; k < case_units.length; k++) {
                  units.push({'year':case_units[k].year, 'units':case_units[k].units});
                }
              }

              ind_date_filed = attribute_values['3_ind_date_filed'];
              if (!angular.isArray(ind_date_filed)) {
                ind_date_filed = [ind_date_filed];
              }

              judge_full_name = attribute_values['0_judge_full_name'];
              if (!angular.isArray(judge_full_name)) {
                judge_full_name = [judge_full_name];
              }

              disease_codes = attribute_values['0_disease_codes'];
              if (!angular.isArray(disease_codes)) {
                disease_codes = [disease_codes];
              }

              ethnicity_of_smoker = attribute_values['0_ethnicity_of_smoker'];
              if (!angular.isArray(ethnicity_of_smoker)) {
                ethnicity_of_smoker = [ethnicity_of_smoker];
              }

              brands = attribute_values['0_brands'];
              if (!angular.isArray(brands)) {
                brands = [brands];
              }

              loc = attribute_values['0_location'];
              if (!angular.isArray(loc)) {
                loc = [loc];
              }

              case_info.push({
                'case_id':case_id,
                'case_name':case_name,
                'ind_date_filed':ind_date_filed,
                'judge_full_name':judge_full_name,
                'disease_codes':disease_codes,
                'ethnicity_of_smoker':ethnicity_of_smoker,
                'brands':brands,
                'location':loc,
                'units':units
              });
            }
          }
        }
      }

      angular.copy(case_info, $scope.case_info);
      $scope.case_info_title = display_name + '/' + facet_value;
      $scope.show_case_info = true;
    });
  };

  $scope.updateTable = function (outcome_facet_name, outcome_facet_display_name, outcome_value, facet_name, facet_value) {
    var category_name = ['Case Profile'];

    var case_name = [];
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      if ($scope.cases_with_outcomes[i].is_selected) {
        case_name.push($scope.cases_with_outcomes[i].name);
      }
    }

    var dynamic_attribute = {};
    // Add the supplied facet name and value to the search criteria.
    dynamic_attribute[facet_name] = [facet_value];

    // Add the supplied outcome facet name and value to the search criteria.
    dynamic_attribute[outcome_facet_name] = [outcome_value];

    for (i = 0; i < $scope.facet_filters.length; i++) {
      var facet_filter = $scope.facet_filters[i];
      if (facet_name !== facet_filter.name) {
        var facet_values = [];
        var values = facet_filter.values;
        for (var j = 0; j < values.length; j++) {
          if (values[j].is_selected) {
            facet_values.push(values[j].value);
          }
        }

        if (facet_values.length > 0) {
          dynamic_attribute[facet_filter.name] = facet_values;
        }
      }
    }

    var dynamic_facet = ['3_ind_date_filed', '0_judge_full_name', '0_disease_codes', '0_ethnicity_of_smoker', '0_brands', '0_location'];

    var query = SearchService.buildQuery('',
        category_name,
        case_name,
        dynamic_attribute,
        {}, // dynamic_date_range
        dynamic_facet, // dynamic facets
        1, // page number
        500, // hits per page
        false);

    SearchService.search(query).then(function (data) {
      var case_info = [];
      for (i = 0; i < data.case_name_facets.length; i++) {
        var case_name = data.case_name_facets[i].value;
        var case_hits = data.hits[case_name];
        // It is possible that there are multiple sources for a case. This is because
        // the 'Pending Case' import files were treated as case profiles. We are going
        // to iterate over the case hits and ignore the pending case sources.
        if (angular.isDefined(case_hits)) {
          for (var j = 0; j < case_hits.length; j++) {
            var case_hit = case_hits[j];
            // Only continue if this hit is not a pending case.
            if (case_hit.file_name.indexOf('Pending_Cases') == -1) {
              var case_id = case_hit.case_id;
              var attribute_values = case_hit.dynamic_attribute_values;
              var units = [];
              var case_units = $scope.case_units_by_year[case_name];
              if (angular.isDefined(case_units)) {
                for (var k = 0; k < case_units.length; k++) {
                  units.push({'year':case_units[k].year, 'units':case_units[k].units});
                }
              }

              case_info.push({
                'case_id':case_id,
                'case_name':case_name,
                'ind_date_filed':attribute_values['3_ind_date_filed'],
                'judge_full_name':attribute_values['0_judge_full_name'],
                'disease_codes':attribute_values['0_disease_codes'],
                'ethnicity_of_smoker':attribute_values['0_ethnicity_of_smoker'],
                'brands':attribute_values['0_brands'],
                'location':attribute_values['0_location'],
                'units':units
              });
            }
          }
        }
      }

      angular.copy(case_info, $scope.case_info);
      $scope.case_info_title = outcome_facet_display_name + '/' + outcome_value;
      $scope.show_case_info = true;
    });
  };

  // Load the cases with outcomes when the controller is loaded.
  $scope.loadCasesWithOutcomes();

  // Load the pending cases when the controller is loaded.
  $scope.loadPendingCases();

  // Load case name cost data.
  $scope.loadCostsByCaseName();
}]);

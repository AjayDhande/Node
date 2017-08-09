function getChartClickData(chartLabel, outcome_facet, outcome_type, facet_values, flag) {
  angular.element(document.getElementById('casesWithOutcomesCtrl')).scope().displayChartInfo(chartLabel, outcome_facet, outcome_type, facet_values, flag);
}

laiApp.controller('CaseWithOutcomesCtrl',["$scope", "$http", "$q", "SearchService", function ($scope, $http, $q, SearchService) {
  // Holds all cases with outcomes and whether each case is being analyzed.
  // [{'name': 'Case 1', 'isSelected': true}, {'name': 'Case 2', 'isSelected': false}]
  $scope.cases_with_outcomes = [];

  $scope.showInfo = false;

  $scope.tableHeading = '';

  // A hash of facet names to outcome values and counts.
  $scope.case_outcomes = {};

  $scope.filter_data = [];

  $scope.outcome_facets = [
    {'display_name':'Industry', 'name':'0_ind_outcome', 'facet_display_name':'Ind Outcome'},
    {'display_name':'BWGroup', 'name':'0_bwgroup_outcome', 'facet_display_name':'Bwgroup Outcome'},
    {'display_name':'Lori', 'name':'0_lori_outcome', 'facet_display_name':'Lori Outcome'},
    {'display_name':'Ltc', 'name':'0_ltc_outcome', 'facet_display_name':'Ltc Outcome'},
    {'display_name':'Pmusa', 'name':'0_pmusa_outcome', 'facet_display_name':'Pmusa Outcome'},
    {'display_name':'Rjrt', 'name':'0_rjrt_outcome', 'facet_display_name':'Rjrt Outcome'}
  ];

  $scope.selected_outcome_facet = $scope.outcome_facets[0];

  $scope.selected_company = '';

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

  $scope.selected_outcome_type = '';

  $scope.other_facets = [
    {'display_name':'Judge Full Name', 'name':'0_judge_full_name', 'is_collapsed':true},
    {'display_name':'Disease Codes', 'name':'0_disease_codes', 'is_collapsed':true},
    {'display_name':'Ethnicity Of Smoker', 'name':'0_ethnicity_of_smoker', 'is_collapsed':true},
    {'display_name':'Counsel Plaintiff', 'name':'0_counsel_plaintiff', 'is_collapsed':true},
    {'display_name':'Trial Counsel', 'name':'0_trial_counsel', 'is_collapsed':true}
  ];

  $scope.selected_other_facet = '';

  $scope.hasCaseOutcomeChartData = false;

  $scope.hasOutcomeByCategory = false;

  $scope.case_name_filter = '';

  $scope.pending_case_name_filter = '';

  $scope.chart_data = {};

  $scope.outcome_by_category = {};

  $scope.filters = [
    {'name':'Judge Full Name', 'is_collapsed':true},
    {'name':'Disease Codes', 'is_collapsed':true},
    {'name':'Ethnicity Of Smoker', 'is_collapsed':true},
    {'name':'Counsel Plaintiff', 'is_collapsed':true},
    {'name':'Trial Counsel', 'is_collapsed':true}
  ];

  $scope.filter = '';

  $scope.filter_selected = $scope.filters[0];

  $scope.chart_display_info = [];
  $scope.pending_chart_display_info = [];

  // A boolean used to show/hide the facet filters.
  $scope.showFacetFilters = false;

  $scope.case_units_by_year = {};


  $scope.loadCasesWithOutcomes = function () {
    var promises = [];
    for (var j = 0; j < $scope.outcome_facets.length; j++) {
      var facet = $scope.outcome_facets[j];
      promises.push($scope.buildQuery(facet.name, $scope.outcome_values, ['Case Profile']));
    }

    var cases = [];
    $q.all(promises).then(function (results) {
      for (var i = 0; i < results.length; i++) {
        var result = results[i];
        for (var k = 0; k < result.case_name_facets.length; k++) {
          var name = result.case_name_facets[k].value;
          if (!$scope.caseNameExists(cases, name)) {
            cases.push({'name':name, 'isSelected':false});
          }
        }
      }

      angular.copy(cases, $scope.cases_with_outcomes);
    });
  };

  $scope.loadCostsByCaseName = function () {
    $http.get('/summary_costs/case_units_by_year.json').success(function (data) {
      angular.copy(data, $scope.case_units_by_year);
    });
  };

  // Select all cases based upon the value of the supplied parameter.
  $scope.selectAllCases = function (checked) {
    for (var i = 0; i < $scope.cases_with_outcomes.length; i++) {
      $scope.cases_with_outcomes[i].isSelected = checked;
    }
  };

  // Determine whether at least one case is selected.
  $scope.isOneCaseSelected = function (cases) {
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].isSelected === true) {
        return true;
      }
    }

    return false;
  };

  $scope.redirectToCaseProfilePage = function (name) {
    window.location = '#/cases/' + name + '/edit';
  };

  $scope.buildQuery = function (facet_name, facet_values, category_names) {
    var dynamic_attribute = {};

    dynamic_attribute[facet_name] = facet_values;

    var query = SearchService.buildQuery('',
        category_names,
        [], //case_name
        dynamic_attribute,
        {}, //dynamic_date_range
        [], //dynamic facets
        1, //page number
        0, //0 means do not return hits
        false);

    return SearchService.search(query);
  };

  //Check and remove the duplicate case names from cases list
  $scope.caseNameExists = function (cases, name) {
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].name === name) {
        return true;
      }
    }

    return false;
  };

  $scope.analyzeCases = function (cases) {
    $scope.getCaseOutcomes(cases).then(function (data) {
      var outcome_data = {};
      // Retrieve the counts for the outcome facets.
      for (var i = 0; i < $scope.outcome_facets.length; i++) {
        var outcome_facet = $scope.outcome_facets[i];
        var facet_values = data.other_facets[outcome_facet.facet_display_name];
        // Only add the outcome facet value to the chart data if there are values defined for it.
        if (angular.isDefined(facet_values) && facet_values != null) {
          // We need the facet name (e.g. 0_ind_outcome), but that is only available
          // when iterating over the facet values. We are going to update this variable
          // every time through the loop.
          var facet_name = '';
          var values = [];
          for (var j = 0; j < facet_values.length; j++) {
            values.push({
              'value':facet_values[j].value,
              'count':facet_values[j].count
            });

            facet_name = facet_values[j].name;
          }

          outcome_data[facet_name] = values;
        }
      }

      // Update the outcome data in the scope.
      angular.copy(outcome_data, $scope.case_outcomes);

      // Load facet values for the facet filters.
      $scope.loadOtherFacets(data.other_facets);

      // Update the cases by outcome chart.
      var facet_name = $scope.outcome_facets[0].name;
      var values = $scope.case_outcomes[facet_name];

      $scope.loadChartData(values);

      $scope.selected_company = '';
      $scope.selected_outcome_type = '';
      $scope.selected_other_facet = '';
      $scope.hasOutcomeByCategory = false;
      $scope.selected_outcome_facet = $scope.outcome_facets[0];
    });

    $scope.showFacetFilters = true;
  };

  $scope.loadOtherFacets = function (other_facets) {
    var filter_data = [];
    // Retrieve the counts for the other facets.
    for (i = 0; i < $scope.other_facets.length; i++) {
      var other_facet = $scope.other_facets[i];
      var facet_values = other_facets[other_facet.display_name];
      // Only add the outcome facet value to the chart data if there are values defined for it.
      if (angular.isDefined(facet_values) && facet_values != null) {
        // We need the facet name (e.g. 0_ind_outcome), but that is only available
        // when iterating over the facet values. We are going to update this variable
        // every time through the loop.
        var facet_name = '';
        var filter_values = [];
        for (j = 0; j < facet_values.length; j++) {
          filter_values.push({
            'value':facet_values[j].value,
            'count':facet_values[j].count,
            'isSelected':false
          });

          facet_name = facet_values[j].name;
        }

        filter_data.push({
          'facet_name':facet_name,
          'display_name':other_facet.display_name,
          'is_collapsed':true,
          'values':filter_values
        });
      }
    }

    // Update the filter data in the scope.
    angular.copy(filter_data, $scope.filter_data);
  }

  //Get the selected case and create the json data for chart
  $scope.loadChartData = function (facet_values) {
    var jsonData = [];
    var chart_label = "";

    var outcome_type = $scope.selected_outcome_facet.display_name;
    if (angular.isDefined(facet_values)) {
      for (var j = 0; j < facet_values.length; j++) {
        chart_label = facet_values[j].value;
        jsonData.push({'label':chart_label, 'value':facet_values[j].count, 'link':"JavaScript:getChartClickData('" + chart_label + "','','" + outcome_type + "','',true);"});
      }

      var data = {
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
      $scope.showInfo = false;
      $scope.hasCaseOutcomeChartData = true;
      angular.copy(data, $scope.chart_data);
    } else {
      $scope.hasCaseOutcomeChartData = false;
    }
  };

  $scope.getCaseOutcomes = function (cases) {
    var case_name = [];
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].isSelected) {
        case_name.push(cases[i].name);
      }
    }

    var category_name = ['Case Profile'];

    var facets = [];
    for (var j = 0; j < $scope.outcome_facets.length; j++) {
      facets.push($scope.outcome_facets[j].name);
    }

    for (var k = 0; k < $scope.other_facets.length; k++) {
      facets.push($scope.other_facets[k].name);
    }

    var query = SearchService.buildQuery(
        '', // query
        category_name, // category name
        case_name, // case name
        {}, // dynamic attribute
        {}, // dynamic date range
        facets, // dynamic facets
        1, // page number
        0, // 0 means do not return hits
        false);

    return SearchService.search(query);
  };

  //Load the category chart depend upon drop down value
  $scope.loadOutComesByCategoryChart = function (outcome_facet, outcome_type, other_facet, cases) {
    if (outcome_facet != '' && outcome_type != '' && other_facet != '') {
      $scope.getCaseOutcomesByOtherFacets(outcome_facet, outcome_type, other_facet, cases).then(function (data) {
        var chart_data = [];
        var displayName = outcome_facet.display_name;
        var otherFacetDisplayName = other_facet.display_name;
        var facet_values = data.other_facets[other_facet.display_name];
        if (angular.isDefined(facet_values)) {
          for (var i = 0; i < facet_values.length; i++) {
            chart_data.push({
              'label':facet_values[i].value,
              'value':facet_values[i].count,
              'link':"JavaScript:getChartClickData('" + displayName + "','" + outcome_type + "','" + facet_values[i].value + "','" + otherFacetDisplayName + "',true);"
            });
          }
          var categoryData = {
            "chart":{
              "showlabels":"0",
              "showvalues":"1",
              "showlegend":"1",
              "legendposition":"bottom",
              "caption":"Outcomes by Category",
              "animation":"1",
              "bgcolor":"FFFFFF",
              "bordercolor":"FFFFFF"

            },
            "data":chart_data
          };
          $scope.hasOutcomeByCategory = true;
          angular.copy(categoryData, $scope.outcome_by_category);

        } else {
          $scope.hasOutcomeByCategory = false;
        }

      });
      $scope.showInfo = false;
    }
  }

  $scope.getCaseOutcomesByOtherFacets = function (outcome_facet, outcome_type, other_facet, cases) {
    var case_name = [];
    for (var i = 0; i < cases.length; i++) {

      if (cases[i].isSelected) {
        case_name.push(cases[i].name);
      }
    }
    var category_name = ['Case Profile'];

    var facets = [other_facet.name];

    var dynamic_attribute = {};

    for (i = 0; i < $scope.filter_data.length; i++) {
      var facet_name = $scope.filter_data[i].facet_name;
      var values = $scope.filter_data[i].values;
      if (angular.isDefined(values)) {
        var facet_values = [];
        for (var j = 0; j < values.length; j++) {
          if (values[j].isSelected) {
            facet_values.push(values[j].value);
          }
        }

        // Only add facets which have values selected.
        if (facet_values.length > 0) {
          dynamic_attribute[facet_name] = facet_values;
        }
      }
    }

    dynamic_attribute[outcome_facet.name] = [outcome_type];

    var query = SearchService.buildQuery('',
        category_name,
        case_name, //case_name
        dynamic_attribute,
        {}, //dynamic_date_range
        facets, //dynamic facets
        1, //page number
        0, //0 means do not return hits
        false);

    return SearchService.search(query);
  }

  $scope.refreshOutcomeChart = function (facet_values) {
    $scope.loadChartData(facet_values);
  }

  //Load the chart data according to filters selected values
  $scope.applyFilters = function (filter_data, cases, selected_outcome_facet) {
    $scope.getCaseOutcomeByFilterValues(filter_data, cases, selected_outcome_facet).then(function (data) {
      var chart_data = {};
      // Retrieve the counts for the outcome facets.
      for (var i = 0; i < $scope.outcome_facets.length; i++) {
        var outcome_facet = $scope.outcome_facets[i];
        var facet_values = data.other_facets[outcome_facet.facet_display_name];
        // Only add the outcome facet value to the chart data if there are values defined for it.
        if (angular.isDefined(facet_values) && facet_values != null) {
          // We need the facet name (e.g. 0_ind_outcome), but that is only available
          // when iterating over the facet values. We are going to update this variable
          // every time through the loop.
          var facet_name = '';
          var values = [];
          for (var j = 0; j < facet_values.length; j++) {
            values.push({
              'value':facet_values[j].value,
              'count':facet_values[j].count
            });

            facet_name = facet_values[j].name;
          }

          chart_data[facet_name] = values;
        }
      }

      // Update the chart data in the scope.
      angular.copy(chart_data, $scope.case_outcomes);

      // Update the case outcomes chart using the selected outcome category (e.g. Ind Outcome).
      var outcome_values = data.other_facets[selected_outcome_facet.facet_display_name];
      $scope.loadChartData(outcome_values);

      for (var i = 0; i < filter_data.length; i++) {
        var display_name = filter_data[i].display_name;
        var facet_values = data.other_facets[display_name];
        if (angular.isDefined(facet_values)) {
          var filter_values = [];
          for (var j = 0; j < facet_values.length; j++) {
            var facet_value = facet_values[j].value;
            // Determine whether the facet value is currently checked using the current filter data.
            var checked = $scope.isFacetValueSelected(filter_data[i].values, facet_value);
            filter_values.push({
              'value':facet_value,
              'count':facet_values[j].count,
              'isSelected':checked
            });
          }

          angular.copy(filter_values, filter_data[i].values);
        }
      }
    });

    $scope.loadOutComesByCategoryChart($scope.selected_company, $scope.selected_outcome_type,
        $scope.selected_other_facet, $scope.cases_with_outcomes);
  }

  $scope.isFacetValueSelected = function (facet_values, facet_value) {
    for (var i = 0; i < facet_values.length; i++) {
      if (facet_values[i].value === facet_value) {
        return facet_values[i].isSelected;
      }
    }

    return false;
  };

  //Get the data according to selected filters values
  $scope.getCaseOutcomeByFilterValues = function (filter_data, cases, selected_outcome_facet) {
    // Always use Case Profile.
    var category_name = ['Case Profile'];

    // Find all of the cases that are checked.
    var case_name = [];
    for (var i = 0; i < cases.length; i++) {
      if (cases[i].isSelected) {
        case_name.push(cases[i].name);
      }
    }

    var dynamic_attribute = {};
    // An array of facet names that we care about.
    var dynamic_facet = [];
    // Find all of the facet values that are checked.
    for (i = 0; i < filter_data.length; i++) {
      var facet_name = filter_data[i].facet_name;
      dynamic_facet.push(facet_name);
      var values = [];
      for (var j = 0; j < filter_data[i].values.length; j++) {
        var value = filter_data[i].values[j];
        if (value.isSelected === true) {
          values.push(value.value);
        }
      }

      if (values.length > 0) {
        dynamic_attribute[facet_name] = values;
      }
    }

    // Add all of the values (e.g. Trial Verdict Plaintiff) for the selected outcome facet (e.g. Ind Outcome).
    dynamic_attribute[selected_outcome_facet.name] = $scope.outcome_values;

    // Add all of the outcome facets to the array of facets that we care about.
    for (i = 0; i < $scope.outcome_facets.length; i++) {
      dynamic_facet.push($scope.outcome_facets[i].name);
    }

    var query = SearchService.buildQuery('',
        category_name,
        case_name,
        dynamic_attribute,
        {}, // dynamic_date_range
        dynamic_facet,
        1, // page number
        0, // 0 means do not return hits
        false);

    return SearchService.search(query);
  }

  //Display the info of case when user click on case outcomes and outcomes by category chart
  $scope.displayChartInfo = function (chartLabel, outcome_facet, outcome_type, facet_values, flag) {
    $scope.showInfo = flag;
    var case_outcome_chart = false;
    if (outcome_facet == '') {
      case_outcome_chart = true;
      $scope.getCaseInfo(chartLabel, $scope.cases_with_outcomes, case_outcome_chart, outcome_type, 'outcomes');

      $scope.tableHeading = outcome_type + '/' + chartLabel;
    } else {
      case_outcome_chart = false;
      $scope.getCaseInfo(outcome_facet, $scope.cases_with_outcomes, case_outcome_chart, outcome_type, 'outcomes');
      $scope.tableHeading = chartLabel + '/' + outcome_facet + '/' + facet_values + '(' + outcome_type + ')';
    }
  };

  $scope.getCaseInfo = function (outcome_type, selected_cases, case_outcome_chart, categoryValue) {
    $scope.getChartInfoQuery(outcome_type, selected_cases, case_outcome_chart, categoryValue).then(function (data) {
      var hits = data.hits;
      var case_info = [];
      for (var i = 0; i < selected_cases.length; i++) {
        if (selected_cases[i].isSelected === true) {
          var case_name = selected_cases[i].name;
          var case_hits = hits[case_name];
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

            angular.copy(case_info, $scope.chart_display_info);
          }
        }
      }
    });
  };

  $scope.getChartInfoQuery = function (chartLabel, selected_cases, case_outcome_chart, categoryValue) {
    var case_name = [];
    for (var i = 0; i < selected_cases.length; i++) {
      if (selected_cases[i].isSelected === true) {
        case_name.push(selected_cases[i].name);
      }
    }

    var category_name = ['Case Profile'];
    var selected_outcome_facet = '';

    var dynamic_attribute = {};

    for (i = 0; i < $scope.filter_data.length; i++) {
      var facet_name = $scope.filter_data[i].facet_name;
      var values = $scope.filter_data[i].values;
      if (angular.isDefined(values)) {
        var facet_values = [];
        for (var j = 0; j < values.length; j++) {
          if (values[j].isSelected) {
            facet_values.push(values[j].value);
          }
        }

        // Only add facets which have values selected.
        if (facet_values.length > 0) {
          dynamic_attribute[facet_name] = facet_values;
        }
      }
    }

    if (case_outcome_chart) {
      selected_outcome_facet = $scope.selected_outcome_facet.name;
      dynamic_attribute[selected_outcome_facet] = [chartLabel];
    } else {
      dynamic_attribute[$scope.selected_company.name] = [chartLabel];
      dynamic_attribute[$scope.selected_other_facet.name] = [categoryValue];
    }

    var query = SearchService.buildQuery('',
        category_name,
        case_name,
        dynamic_attribute,
        {}, // dynamic_date_range
        [], // dynamic facets
        1, // page number
        500, // hits per page
        false);

    return SearchService.search(query);
  }

  // Load all of the cases with outcomes.
  $scope.loadCasesWithOutcomes();
  // Load cost data associated with cases.
  $scope.loadCostsByCaseName();
}]);

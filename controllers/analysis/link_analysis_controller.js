laiApp.controller('LinkAnalysisCtrl', ["$scope", "$http", "$q", "SearchService", function ($scope, $http, $q, SearchService) {
  // A list of analyses that can be performed.
  $scope.analyses = [
    {'name': 'Select', 'group': ""},
    {'name': 'Cases', 'group': 'Judge Analysis'},
    {'name': 'Trial Exhibits', 'group': 'Judge Analysis'},
    {'name': 'Transcripts', 'group': 'Judge Analysis'},
    {'name': 'Trial Support Documents', 'group': "Judge Analysis"},
    {'name': 'All', 'group': "Judge Analysis"}

//    {'name': 'Plaintiff Verdicts', 'group': ""},
//    {'name': 'Defense Verdicts', 'group': ""}
  ];

  $scope.filtersOrganized = {
    'Cases': ['Active Cases', 'Pending Cases'],
    'Trial Exhibits': ['Defense Admitted Trial Exhibits', 'Defense Excluded Trial Exhibits', 'Plaintiff Admitted Trial Exhibits', 'Plaintiff Excluded Trial Exhibits'],
    'Transcripts': ['Hearing Transcripts', 'Jury Selection Transcripts'],
    'Trial Support Documents': ['Master Orders', 'Pending Cases', 'Plaintiff Mils Granted']
  };

  // The currently selected analysis.
  $scope.selected_analysis = $scope.analyses[0];

  // The currently selected judge.
  $scope.judge = {};

  // A hash of judge name to known aliases.
  $scope.judge_aliases = {};

  // A list of judges.
  $scope.judges = [];

  // Used to filter the list of judges.
  $scope.judge_name_filter = '';

  // Holds a list of cases for the selected judge. Require for exhibit filters.
  $scope.cases_for_judge = [];

  $scope.hideSourceTab = false;


  $scope.getFiltersToDisplay = function (selectedFilter) {
    var tempFilters = [];
    for (var m = 0; m < $scope.displayFilters.length; m++) {
      for (var n = 0; n < $scope.filtersOrganized[selectedFilter].length; n++) {
        if ($scope.displayFilters[m].name == $scope.filtersOrganized[selectedFilter][n]) {
          tempFilters.push($scope.displayFilters[m]);
        }
      }
    }
    return tempFilters;
  }

  $scope.populateFilters = function (name) {
    $scope.reset();
    if (name == 'All') {
      angular.copy($scope.displayFilters, $scope.filters);
    } else if (name == 'Select') {
      angular.copy([], $scope.filters);
    } else if (name != 'Plaintiff Verdicts' && name != 'Defense Verdicts') {
      angular.copy($scope.getFiltersToDisplay(name), $scope.filters);
    }
  };

  $scope.filters = [];

  //TODO move to server
  $scope.displayFilters = [
    {
      'name': 'Active Cases',
      'in_use': false,
      'judge_dynamic_attribute': 'Judge Full Name',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_ind_date_filed',
      'tooltip_attributes': [
        {'name': 'Case Caption', 'facet_name': '0_case_caption', 'max_chars': 50},
        {'name': 'Description', 'facet_name': '0_description', 'max_chars': 20},
        {'name': 'Ind Date Filed', 'facet_name': '3_ind_date_filed', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Case Profile', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Judge Full Name', 'facet_name': '0_judge_full_name', 'value': null, 'visible': false, 'use_alias': true, 'alias_type': 'JudgeAlias'},
          {'display_name': 'Engle Case Active Pltfs', 'facet_name': '0_engle_case_active_pltfs', 'value': 'Y', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Industry Date Filed*', 'facet_name': '3_ind_date_filed', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Trial Date', 'facet_name': '3_trial_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    /*
     {
     'name': 'Defense Admitted Deposition Exhibits',
     'in_use': false,
     'judge_dynamic_attribute': null,
     'include_case_names': true,
     'is_collapsed': true,
     'source_node_name_facet_name': '3_addat',
     'tooltip_attributes': [
     {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
     {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
     {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
     {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
     {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
     {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
     {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
     ],
     'criteria': {
     'category': [
     {'name': 'Deposition Exhibit', 'visible': false}
     ],
     'dynamic_attribute': [
     {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Defendant', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Redacted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Partial', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Limited', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (Partial)', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (With redactions)', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Problem', 'visible': false, 'use_alias': false, 'alias_type': null}
     ],
     'dynamic_date_range': [
     {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
     ]
     }
     },
     */
    {
      'name': 'Defense Admitted Trial Exhibits',
      'in_use': false,
      'judge_dynamic_attribute': null,
      'include_case_names': true,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_addat',
      'tooltip_attributes': [
        {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
        {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
        {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
        {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
        {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Trial Exhibit', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Defendant', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Redacted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Partial', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Limited', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (Partial)', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (With redactions)', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Problem', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    /*
     {
     'name': 'Defense Excluded Deposition Exhibits',
     'in_use': false,
     'judge_dynamic_attribute': null,
     'include_case_names': true,
     'is_collapsed': true,
     'source_node_name_facet_name': '3_addat',
     'tooltip_attributes': [
     {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
     {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
     {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
     {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
     {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
     {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
     {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
     ],
     'criteria': {
     'category': [
     {'name': 'Deposition Exhibit', 'visible': false}
     ],
     'dynamic_attribute': [
     {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Defendant', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Excluded', 'visible': false, 'use_alias': false, 'alias_type': null}
     ],
     'dynamic_date_range': [
     {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
     ]
     }
     },
     */
    {
      'name': 'Defense Excluded Trial Exhibits',
      'in_use': false,
      'judge_dynamic_attribute': null,
      'include_case_names': true,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_addat',
      'tooltip_attributes': [
        {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
        {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
        {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
        {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
        {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Trial Exhibit', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Defendant', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Excluded', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    /*
     {
     'name': 'Defense Mils Granted',
     'in_use': false,
     'judge_dynamic_attribute': 'Author',
     'include_case_names': false,
     'is_collapsed': true,
     'source_node_name_facet_name': '3_date_filed',
     'tooltip_attributes': [
     {'name': 'Date Filed', 'facet_name': '3_date_filed', 'max_chars': -1},
     {'name': 'Date Served', 'facet_name': '3_date_served', 'max_chars': -1},
     {'name': 'Ind Case Status', 'facet_name': '0_ind_case_status', 'max_chars': -1},
     {'name': 'Ind Outcome', 'facet_name': '0_ind_outcome', 'max_chars': -1},
     {'name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'max_chars': -1},
     {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
     {'name': 'Trial Date', 'facet_name': '3_trial_date', 'max_chars': -1}
     ],
     'criteria': {
     'category': [
     {'name': 'Pleading', 'visible': false}
     ],
     'dynamic_attribute': [
     {'display_name': 'Author', 'facet_name': '0_author', 'value': null, 'visible': false},
     {'display_name': 'Party', 'facet_name': '0_party', 'value': 'Defendant', 'visible': false},
     {'display_name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'value': 'Motion', 'visible': false},
     {'display_name': 'Link', 'facet_name': '0_link', 'value': 'AWPLimine', 'visible': false},
     {'display_name': 'Status', 'facet_name': '0_status', 'value': 'Granted', 'visible': false},
     {'display_name': 'Status', 'facet_name': '0_status', 'value': 'Granted in Part', 'visible': false}
     ],
     'dynamic_date_range': [
     {'display_name': 'Date Filed*', 'facet_name': '3_date_filed', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Date Served', 'facet_name': '3_date_served', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Trial Date', 'facet_name': '3_trial_date', 'start': null, 'end': null, 'visible': true}
     ]
     }
     },
     */
    {
      'name': 'Hearing Transcripts',
      'in_use': false,
      'judge_dynamic_attribute': 'Judge',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_date',
      'tooltip_attributes': [
        {'name': 'Date', 'facet_name': '3_date', 'max_chars': -1},
        {'name': 'Doc Type', 'facet_name': '0_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30}
      ],
      'criteria': {
        'category': [
          {'name': 'Transcript', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Judge', 'facet_name': '0_judge', 'value': null, 'visible': false, 'use_alias': true, 'alias_type': 'JudgeAlias'},
          {'display_name': 'Doc Type', 'facet_name': '0_doc_type', 'value': 'Hearing', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Date*', 'facet_name': '3_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    {
      'name': 'Jury Selection Transcripts',
      'in_use': false,
      'judge_dynamic_attribute': 'Judge',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_date',
      'tooltip_attributes': [
        {'name': 'Date', 'facet_name': '3_date', 'max_chars': -1},
        {'name': 'Doc Type', 'facet_name': '0_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30}
      ],
      'criteria': {
        'category': [
          {'name': 'Transcript', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Judge', 'facet_name': '0_judge', 'value': null, 'visible': false, 'use_alias': true, 'alias_type': 'JudgeAlias'},
          {'display_name': 'Doc Type', 'facet_name': '0_doc_type', 'value': 'Trial', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Trial Portion', 'facet_name': '0_trial_portion', 'value': 'Voir Dire (Jury Selection)', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Trial Portion', 'facet_name': '0_trial_portion', 'value': 'Voir Dire (Jury Selection)-Court', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Trial Portion', 'facet_name': '0_trial_portion', 'value': 'Voir Dire (Jury Selection)-Defendant', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Trial Portion', 'facet_name': '0_trial_portion', 'value': 'Voir Dire (Jury Selection)-Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Date*', 'facet_name': '3_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    {
      'name': 'Master Orders',
      'in_use': false,
      'judge_dynamic_attribute': 'Author',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_date_filed',
      'tooltip_attributes': [
        {'name': 'Date Filed', 'facet_name': '3_date_filed', 'max_chars': -1},
        {'name': 'Date Served', 'facet_name': '3_date_served', 'max_chars': -1},
        {'name': 'Ind Case Status', 'facet_name': '0_ind_case_status', 'max_chars': -1},
        {'name': 'Ind Outcome', 'facet_name': '0_ind_outcome', 'max_chars': -1},
        {'name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Trial Date', 'facet_name': '3_trial_date', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Pleading', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Author', 'facet_name': '0_author', 'value': null, 'visible': false, 'use_alias': true, 'alias_type': 'JudgeAlias'},
          {'display_name': 'Master', 'facet_name': '0_master', 'value': 'Y', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'value': 'Order', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Date Filed*', 'facet_name': '3_date_filed', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Date Served', 'facet_name': '3_date_served', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Trial Date', 'facet_name': '3_trial_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    {
      'name': 'Pending Cases',
      'in_use': false,
      'judge_dynamic_attribute': 'Judge Full Name',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_ind_date_filed',
      'tooltip_attributes': [
        {'name': 'Case Caption', 'facet_name': '0_case_caption', 'max_chars': 50},
        {'name': 'Description', 'facet_name': '0_description', 'max_chars': 20},
        {'name': 'Ind Date Filed', 'facet_name': '3_ind_date_filed', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Case Profile', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Judge Full Name', 'facet_name': '0_judge_full_name', 'value': null, 'visible': false},
          {'display_name': 'Industry Case Status', 'facet_name': '0_ind_case_status', 'value': 'Pending', 'visible': false}
        ],
        'dynamic_date_range': [
          {'display_name': 'Industry Date Filed*', 'facet_name': '3_ind_date_filed', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Trial Date', 'facet_name': '3_trial_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    /*
     {
     'name': 'Plaintiff Admitted Deposition Exhibits',
     'in_use': false,
     'judge_dynamic_attribute': null,
     'include_case_names': true,
     'is_collapsed': true,
     'source_node_name_facet_name': '3_addat',
     'tooltip_attributes': [
     {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
     {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
     {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
     {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
     {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
     {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
     {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
     ],
     'criteria': {
     'category': [
     {'name': 'Deposition Exhibit', 'visible': false}
     ],
     'dynamic_attribute': [
     {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Redacted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Partial', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Limited', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (Partial)', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (With redactions)', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Problem', 'visible': false, 'use_alias': false, 'alias_type': null}
     ],
     'dynamic_date_range': [
     {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
     ]
     }
     },
     */
    {
      'name': 'Plaintiff Admitted Trial Exhibits',
      'in_use': false,
      'judge_dynamic_attribute': null,
      'include_case_names': true,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_addat',
      'tooltip_attributes': [
        {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
        {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
        {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
        {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
        {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Trial Exhibit', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Redacted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted - Partial', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Limited', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted with Redactions', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Previously Admitted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (Partial)', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted (With redactions)', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Admitted-Problem', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    /*
     {
     'name': 'Plaintiff Excluded Deposition Exhibits',
     'in_use': false,
     'judge_dynamic_attribute': null,
     'include_case_names': true,
     'is_collapsed': true,
     'source_node_name_facet_name': '3_addat',
     'tooltip_attributes': [
     {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
     {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
     {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
     {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
     {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
     {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
     {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
     ],
     'criteria': {
     'category': [
     {'name': 'Deposition Exhibit', 'visible': false}
     ],
     'dynamic_attribute': [
     {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null},
     {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Excluded', 'visible': false, 'use_alias': false, 'alias_type': null}
     ],
     'dynamic_date_range': [
     {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
     {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
     ]
     }
     },
     */
    {
      'name': 'Plaintiff Excluded Trial Exhibits',
      'in_use': false,
      'judge_dynamic_attribute': null,
      'include_case_names': true,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_addat',
      'tooltip_attributes': [
        {'name': 'Addat', 'facet_name': '3_addat', 'max_chars': -1},
        {'name': 'Admitted Date', 'facet_name': '0_admitted_date', 'max_chars': -1},
        {'name': 'Datus', 'facet_name': '0_datus', 'max_chars': -1},
        {'name': 'Idate', 'facet_name': '0_idate', 'max_chars': -1},
        {'name': 'Secondary Doc Type', 'facet_name': '0_secondary_doc_type', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Witnm', 'facet_name': '0_witnm', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Trial Exhibit', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Party Offering', 'facet_name': '0_party_offering', 'value': 'Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Exhst', 'facet_name': '0_exhst', 'value': 'Excluded', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Addat*', 'facet_name': '3_addat', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Admitted Date', 'facet_name': '3_admitted_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    },
    {
      'name': 'Plaintiff Mils Granted',
      'in_use': false,
      'judge_dynamic_attribute': 'Judge Full Name',
      'include_case_names': false,
      'is_collapsed': true,
      'source_node_name_facet_name': '3_date_served',
      'tooltip_attributes': [
        {'name': 'Date Filed', 'facet_name': '3_date_filed', 'max_chars': -1},
        {'name': 'Date Served', 'facet_name': '3_date_served', 'max_chars': -1},
        {'name': 'Ind Case Status', 'facet_name': '0_ind_case_status', 'max_chars': -1},
        {'name': 'Ind Outcome', 'facet_name': '0_ind_outcome', 'max_chars': -1},
        {'name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'max_chars': -1},
        {'name': 'Title', 'facet_name': '0_title', 'max_chars': 30},
        {'name': 'Trial Date', 'facet_name': '3_trial_date', 'max_chars': -1}
      ],
      'criteria': {
        'category': [
          {'name': 'Pleading', 'visible': false}
        ],
        'dynamic_attribute': [
          {'display_name': 'Judge Full Name', 'facet_name': '0_judge_full_name', 'value': null, 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Party', 'facet_name': '0_party', 'value': 'Plaintiff', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Secondary Doctype', 'facet_name': '0_secondary_doctype', 'value': 'Motion', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Link', 'facet_name': '0_link', 'value': 'AWPLimine', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Status', 'facet_name': '0_status', 'value': 'Granted', 'visible': false, 'use_alias': false, 'alias_type': null},
          {'display_name': 'Status', 'facet_name': '0_status', 'value': 'Granted in Part', 'visible': false, 'use_alias': false, 'alias_type': null}
        ],
        'dynamic_date_range': [
          {'display_name': 'Date Filed', 'facet_name': '3_date_filed', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Date Served*', 'facet_name': '3_date_served', 'start': null, 'end': null, 'visible': true},
          {'display_name': 'Trial Date', 'facet_name': '3_trial_date', 'start': null, 'end': null, 'visible': true}
        ]
      }
    }
  ];


  $scope.filter = null;

  $scope.selected_node = '';

  //Used to assign the selected date range
  $scope.date_filter_hash = {};
  for (var i = 0; i < $scope.displayFilters.length; i++) {
    $scope.date_filter_hash[$scope.displayFilters[i].name] =
    {
      'display_name': '',
      'start': null,
      'end': null
    };
  }

  $scope.default_judge_node = {
    'id': 'judge_id',
    'name': '',
    'data': {
      'type': 'judge', 'id': -1
    },
    'children': []
  };

  $scope.graph_data = {};
  angular.copy($scope.default_judge_node, $scope.graph_data);

  $scope.current_node = {};
  angular.copy($scope.default_judge_node, $scope.current_node);

  //Highlight the root node of tree view on page load
  $scope.selected_node = $scope.current_node.id;

  $scope.current_source = {};

  //Get the node value from graph
  $scope.$watch('current_node', function (newValue, oldValue, scope) {
    if (scope.current_node.data['type'] === 'source') {

      //Set the flag to display the source detail in Source Detail tab
      scope.hideSourceTab = true;

      var id = scope.current_node.data['id'];
      var case_id = scope.current_node.data['case_id'];

      $http.get('/cases/' + case_id + '/sources/' + id + '.json').success(function (data) {
        angular.copy(data, scope.current_source);

      });
    }
  }, true);

  $scope.loadJudges = function () {
    $http.get('reference_data.json?type=JudgeAlias').success(function (data) {
      for (var i = 0; i < data.length; i++) {
        var key = data[i].key;
        var value = data[i].value;
        var alias_list = $scope.judge_aliases[value];
        if (typeof alias_list == 'undefined') {
          alias_list = [];
          $scope.judge_aliases[value] = alias_list;
        }

        alias_list.push(key);
      }
    });

    var categories = [];
    categories.push('Case Profile');

    var dynamic_facets = [];
    dynamic_facets.push('0_judge_full_name');
    dynamic_facets.push('0_original_judge');

    var query = SearchService.buildQuery(
      '', // query
      categories, // category names
      [], // case name
      {}, // dynamic attributes
      {}, // dynamic date range
      dynamic_facets, // dynamic facets
      1, // current page
      0, // number per page -- 0 means do not search
      false); // exclude filters

    SearchService.search(query).then(function (data) {
      // Temporarily store the judges in a hash to make checking for duplicates simpler.
      var judge_hash = {};
      var full_names = data.other_facets['Judge Full Name'];
      if (full_names != undefined) {
        for (var i = 0; i < full_names.length; i++) {
          var judge = {'name': full_names[i].value};
          if (!(judge.name in judge_hash)) {
            judge_hash[judge.name] = judge;
          }
        }
      }

      var original_names = data.other_facets['Original Judge'];
      if (original_names != undefined) {
        for (var i = 0; i < original_names.length; i++) {
          var judge = {'name': original_names[i].value};
          if (!(judge.name in judge_hash)) {
            judge_hash[judge.name] = judge;
          }
        }
      }

      // Pull out all of the values in the judge hash and add them to the array of judges.
      for (var key in judge_hash) {
        if (judge_hash.hasOwnProperty(key)) {
          $scope.judges.push(judge_hash[key]);
        }
      }
    });
  };

  $scope.setJudge = function (judge) {
    // Reset the page before updating the judge.
    $scope.reset();

    // Copy the judge since reset is going to wipe out the reference.
    angular.copy(judge, $scope.judge);

    // Load the cases associated with the judge. This is required
    // for the deposition and trial exhibit filters.
    $scope.loadCasesForJudge(judge);
  };

  $scope.loadCasesForJudge = function (judge) {
    var categories = [];
    categories.push('Case Profile');

    var dynamic_attributes = {};
    dynamic_attributes['0_judge_full_name'] = [judge.name];

    var query = SearchService.buildQuery(
      '', // query
      categories, // category names
      [], // case name
      dynamic_attributes, // dynamic attributes
      {}, // dynamic date range
      [], // dynamic facets
      1, // current page
      0, // number per page -- 0 means do not search
      false); // exclude filters

    SearchService.search(query).then(function (data) {
      var cases = [];
      for (var i = 0; i < data.case_name_facets.length; i++) {
        var case_facet = data.case_name_facets[i];
        cases.push({'name': case_facet.value});
      }

      angular.copy(cases, $scope.cases_for_judge);
    });
  };

  $scope.enableFilter = function (filter, enable) {
    filter.in_use = enable;
  };

  $scope.enableDateRange = function (dateRange, enable) {
    dateRange.visible = enable;
  };

  $scope.hasFilterInUse = function (filters) {
    for (var i = 0; i < filters.length; i++) {
      if (filters[i].in_use === true) {
        return true;
      }
    }

    return false;
  };

  $scope.buildGraphData = function (judge, results) {
    var filters = [];
    var tooltip = '';
    for (var filter_name in results) {
      if (results.hasOwnProperty(filter_name)) {
        var filter = $scope.getFilterByName(filter_name);
        var cases = results[filter_name];
        var filter_cases = [];
        var filter_id = filter_name.toLowerCase().replace(/ /g, "_");
        for (var i = 0; i < cases.length; i++) {
          var acase = cases[i];
          var case_sources = [];
          var case_id = filter_id + '_case_' + acase.id;
          for (var j = 0; j < acase.sources.length; j++) {
            var source = acase.sources[j];
            var source_id = case_id + '_source_' + source.id;
            tooltip = '';
            for (var k = 0; k < filter.tooltip_attributes.length; k++) {
              var name = filter.tooltip_attributes[k].name;
              var facet_name = filter.tooltip_attributes[k].facet_name;
              var max = filter.tooltip_attributes[k].max_chars;
              var value = source.attributes[facet_name];
              if (angular.isArray(value)) {
                value = value.join(';');
              }

              if (max != -1 && value && value.length > max) {
                value = value.substring(0, max);
              }

              tooltip += name;
              tooltip += ': ';
              tooltip += value;
              tooltip += '<br/>';
            }

            case_sources.push({
              'id': source_id,
              'name': source.name,
              'data': {
                'type': 'source',
                'id': source.id,
                'case_id': acase.id,
                'tooltip': tooltip
              },
              'source_is_collapsed': true
            });
          }

          tooltip = acase.name + '<br/>';
          tooltip += case_sources.length + ' Source';
          // Attempt to be grammatically correct.
          if (case_sources.length !== 1) {
            tooltip += 's';
          }

          filter_cases.push({
            'id': case_id,
            'name': acase.name,
            'data': {
              'type': 'case',
              'id': acase.id,
              'tooltip': tooltip
            },
            'children': case_sources,
            'case_is_collapsed': true
          });
        }

        tooltip = filter_name + '<br/>';
        tooltip += filter_cases.length + ' Case';
        // Attempt to be grammatically correct.
        if (filter_cases.length !== 1) {
          tooltip += 's';
        }

        filters.push({
          'id': filter_id,
          'name': filter_name,
          'data': {
            'type': 'filter',
            'id': -1,
            'tooltip': tooltip
          },
          'children': filter_cases,
          'filter_is_collapsed': true
        });
      }
    }

    var data = {
      'id': 'judge_id',
      'name': judge.name,
      'data': {
        'type': 'judge',
        'id': -1,
        'tooltip': judge.name
      },
      'children': filters
    };

    angular.copy(data, $scope.graph_data);
    angular.copy(data, $scope.current_node);

    //Hide the source details of source tab
    $scope.hideSourceTab = false;

    //Highlight the root tree node after user click apply button
    var node_id = $scope.current_node.id;
    $scope.selected_node = node_id;
  };

  $scope.applyFilters = function (filters) {
    var promise_hash = {};
    for (var i = 0; i < filters.length; i++) {
      var filter = filters[i];
      if (filter.in_use) {
        var date_range = $scope.date_filter_hash[filter.name];
        var dynamic_date_range = {};

        if (angular.isDefined(date_range) && angular.isDefined(date_range.start) &&
          angular.isDefined(date_range.end) && date_range.start != null &&
          date_range.end != null) {
          for (var j = 0; j < filter.criteria.dynamic_date_range.length; j++) {
            var dateAttr = filter.criteria.dynamic_date_range[j];
            if (dateAttr.display_name === date_range.display_name) {
              dynamic_date_range[dateAttr.facet_name] = {
                'display_name': date_range.display_name,
                'start': date_range.start,
                'end': date_range.end
              };
            }
          }
        }

        var case_name = [];
        if (filter.include_case_names) {
          for (var c = 0; c < $scope.cases_for_judge.length; c++) {
            case_name.push($scope.cases_for_judge[c].name);
          }
        }

        var category_name = [];
        for (var k = 0; k < filter.criteria.category.length; k++) {
          var category = filter.criteria.category[k];
          category_name.push(category.name);
        }

        var dynamic_attribute = {};
        for (var x = 0; x < filter.criteria.dynamic_attribute.length; x++) {
          var attrib = filter.criteria.dynamic_attribute[x];
          var facet_name = attrib.facet_name;

          // Determine whether there is already a list of values.
          var values = dynamic_attribute[facet_name];
          if (!angular.isDefined(values)) {
            values = [];
            dynamic_attribute[facet_name] = values;
          }

          // Check whether we need to replace the attribute value with an actual value.
          if (filter.judge_dynamic_attribute === attrib.display_name) {
            // Add the real judge name as a value.
            values.push($scope.judge.name);
            var aliases = $scope.judge_aliases[$scope.judge.name];
            if (angular.isDefined(aliases)) {
              for (var y = 0; y < aliases.length; y++) {
                values.push(aliases[y]);
              }
            }
          } else {
            // Add the value to the list.
            values.push(attrib.value);
          }
        }

        // TODO: How to retrieve all documents instead of only 500?
        var query = SearchService.buildQuery(
          '',
          category_name,
          case_name,
          dynamic_attribute,
          dynamic_date_range,
          [],
          1,
          500,
          false);

        var promise = SearchService.search(query);
        promise_hash[filter.name] = promise;
      }
    }

    var filters_in_use = [];
    var promises = [];
    // We want to wait until all of the promises are ready. The $q.all function
    // will return the results in the same order that we pass them. Create
    // an array of filter names and array of promises so that we can tie the
    // results back to the filter.
    for (var filter_name in promise_hash) {
      if (promise_hash.hasOwnProperty(filter_name)) {
        var promise = promise_hash[filter_name];
        filters_in_use.push(filter_name);
        promises.push(promise);
      }
    }

    $q.all(promises).then(function (results) {
      var search_results = {};
      for (var z = 0; z < results.length; z++) {
        var result = results[z];
        var filter = $scope.getFilterByName(filters_in_use[z]);
        var cases = [];
        for (var case_name in result.hits) {
          if (result.hits.hasOwnProperty(case_name)) {
            var hits = result.hits[case_name];
            var c = {'id': null, 'name': case_name, 'sources': []};
            for (var h = 0; h < hits.length; h++) {
              var hit = hits[h];
              c.id = hit.case_id;
              var name = hit.dynamic_attribute_values[filter.source_node_name_facet_name]
              if (angular.isArray(name)) {
                name = name.join(';');
              }

              c.sources.push({'id': hit.source_id, 'name': name, 'attributes': hit.dynamic_attribute_values});
            }

            cases.push(c);
          }
        }

        search_results[filter.name] = cases;
      }

      $scope.buildGraphData($scope.judge, search_results);
    });
  }

  // Resets the page by removing all filters from being in use, clearing the selected judge,
  // and removing the graph data.
  $scope.reset = function () {
    $scope.judge = {};

    for (var i = 0; i < $scope.filters.length; i++) {
      // Unselect all filters.
      $scope.filters[i].in_use = false;


      // Unselect date filters and remove any dates that may have been provided.
      $scope.date_filter_hash[$scope.filters[i].name].display_name = '';
      $scope.date_filter_hash[$scope.filters[i].name].start = null;
      $scope.date_filter_hash[$scope.filters[i].name].end = null;
    }

    angular.copy($scope.default_judge_node, $scope.graph_data);
  };

  //Pass the selected node id value to view to  highlight selected tree node
  $scope.highlightTreeNode = function (id, nodeType) {
    $scope.selected_node = id;
    $scope.hideSourceDetail(nodeType);
  };

  //Highlight the tree node when user click the highlight view icon
  $scope.highlightTreeNodeOnClick = function (id, nodeType) {
    $scope.selected_node = id;
    //Show the source tab data only if type  is source
    $scope.hideSourceDetail(nodeType);
  };


  //Calling the directive method from controller
  $scope.centerGraph = function (directiveFn) {
    $scope.directiveFn = directiveFn;
  };


  //Show the source tab data only if type  is source
  $scope.hideSourceDetail = function (nodeType) {
    $scope.hideSourceTab = (nodeType === 'source');
  };

  //Load the source details when user click on the  highlight view icon of analysis info tree node
  $scope.loadSourceDetail = function (sourceId, caseId) {
    $http.get('/cases/' + caseId + '/sources/' + sourceId + '.json').success(function (data) {
      angular.copy(data, $scope.current_source);
    });
  };

  $scope.getFilterByName = function (name) {
    for (var i = 0; i < $scope.filters.length; i++) {
      if ($scope.filters[i].name === name) {
        return $scope.filters[i];
      }
    }

    return null;
  };

  $scope.loadJudges();
}]);

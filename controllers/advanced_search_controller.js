laiApp.controller('AdvancedSearchCtrl', ['$scope', '$http', function ($scope, $http) {
  $scope.logical_operators = [
    {'name': 'All', 'type': 'AND'},
    {'name': 'Any', 'type': 'OR'}
  ];

  $scope.operators = {
    'string': [
      {'name': 'contains', 'type': 'string', 'range': false},
      {'name': 'does not contain', 'type': 'string', 'range': false},
      {'name': 'is', 'type': 'string', 'range': false},
      {'name': 'is not', 'type': 'string', 'range': false}
      //{'name': 'starts with', 'type': 'string', 'range': false}
      //{'name': 'ends with', 'type': 'string', 'range': false},
    ],
    'date': [
      {'name': 'is', 'type': 'date', 'range': false},
      {'name': 'is not', 'type': 'date', 'range': false},
      {'name': 'is after', 'type': 'date', 'range': false},
      {'name': 'is before', 'type': 'date', 'range': false},
      //{'name': 'in the last', 'type': 'date', 'range': false},
      //{'name': 'not in the last', 'type': 'date', 'range': false},
      {'name': 'is in the range', 'type': 'date', 'range': true}
    ],
    'numeric': [
      {'name': 'is', 'type': 'numeric', 'range': false},
      {'name': 'is not', 'type': 'numeric', 'range': false},
      {'name': 'is greater than', 'type': 'numeric', 'range': false},
      {'name': 'is less than', 'type': 'numeric', 'range': false},
      {'name': 'is in the range', 'type': 'numeric', 'range': true}
    ]
  };

  // Holds the list of facetable attributes.
  $scope.attributes = [];

  // Holds search results.
  $scope.hits = {
    'total': 0,
    'hits': []
  };

  // An array of attributes that will appear in the results table.
  $scope.column_attributes = [];

  $scope.addGroup = function () {
    $scope.query.conditions.push({'type': 'group', 'logical_operator': null, 'conditions': []});
    // Set the logical operator on the query if there are exactly two conditions in the query.
    if ($scope.query.conditions.length === 2) {
      $scope.query.logical_operator = $scope.logical_operators[0];
    }
  };

  $scope.addRule = function () {
    var attribute = $scope.attributes[0];
    var operator = $scope.operators[attribute.type][0];
    $scope.query.conditions.push({'type': 'rule', 'attribute': attribute, 'operator': operator, 'values': [null, null]});
    // Set the logical operator on the query if there are exactly two conditions in the query.
    if ($scope.query.conditions.length === 2) {
      $scope.query.logical_operator = $scope.logical_operators[0];
    }
  };

  $scope.removeRule = function (query, index) {
    query.conditions.splice(index, 1);
    if (query.conditions.length < 2) {
      query.logical_operator = null;
    }
  };

  $scope.removeGroup = function (query, index) {
    query.conditions.splice(index, 1);
    if (query.conditions.length < 2) {
      query.logical_operator = null;
    }
  };

  $scope.addRuleToGroup = function (group) {
    var attribute = $scope.attributes[0];
    var operator = $scope.operators[attribute.type][0];
    group.conditions.push({'type': 'rule', 'attribute': attribute, 'operator': operator, 'values': [null, null]});
    // Set the logical operator on the group if there are exactly two rules in the group.
    if (group.conditions.length === 2) {
      group.logical_operator = $scope.logical_operators[0];
    }
  };

  $scope.removeRuleFromGroup = function (group, index) {
    group.conditions.splice(index, 1);
    if (group.conditions.length < 2) {
      group.logical_operator = null;
    }
  };

  $scope.setDefaultOperator = function (rule) {
    // Select the first operator for type of the selected attribute.
    rule.operator = $scope.operators[rule.attribute.type][0];
    // Reset the values for the rule so that we do not end up with a date value
    // in a numeric field.
    var values = [null, null];
    angular.copy(values, rule.values);
  };

  $scope.isValid = function () {
    //TODO: Validate that rule values are defined and of the right type.
    return true;
  };

  $scope.search = function (query) {
    var logical_operator = null;
    if (query.logical_operator) {
      logical_operator = query.logical_operator.type;
    }

    var conditions = [];
    for (var i = 0; i < query.conditions.length; i++) {
      var condition = query.conditions[i];
      if (condition.type === 'rule') {
        conditions.push({
          'condition_type': 'rule',
          'attribute': condition.attribute.facet_name,
          'type': condition.operator.type,
          'operator': condition.operator.name,
          'values': condition.values
        });
      } else {
        var group_logical_operator = null;
        if (condition.logical_operator) {
          group_logical_operator = condition.logical_operator.type;
        }

        var rules = [];
        for (var j = 0; j < condition.conditions.length; j++) {
          var rule = condition.conditions[j];
          rules.push({
            'condition_type': 'rule',
            'attribute': rule.attribute.facet_name,
            'type': rule.operator.type,
            'operator': rule.operator.name,
            'values': rule.values
          });
        }

        conditions.push({
          'condition_type': 'group',
          'logical_operator': group_logical_operator,
          'conditions': rules
        });
      }
    }

    var page_size = 50;
    var from = ($scope.query.page - 1) * page_size;

    var search = {
      'q': $scope.query.q,
      'size': page_size,
      'from': from,
      'logical_operator': logical_operator,
      'conditions': conditions
    };

    $http.post('/search/advanced.json', search, {tracker:'ajaxCall'}).success(function (data) {
      angular.copy(data['hits'], $scope.hits);

      // Clear out the old column attributes in case they have changed.
      $scope.column_attributes.length = 0;

      for (i = 0; i < $scope.query.conditions.length; i++) {
        var condition = query.conditions[i];
        if (condition.type === 'rule') {
          if (!$scope.containsAttribute($scope.column_attributes, condition.attribute)) {
            $scope.column_attributes.push(condition.attribute);
          }
        } else {
          for (j = 0; j < condition.conditions.length; j++) {
            if (!$scope.containsAttribute($scope.column_attributes, condition.conditions[j].attribute)) {
              $scope.column_attributes.push(condition.conditions[j].attribute);
            }
          }
        }
      }
    });
  }

  $scope.pageChanged = function(page) {
    $scope.query.page = page;
    $scope.search($scope.query);
  };

  $scope.joinValues = function (value) {
    // Check whether we were passed an array of strings.
    if (Object.prototype.toString.call(value) === '[object Array]') {
      return value.join(';');
    } else {
      return value;
    }
  };

  $scope.containsAttribute = function (columns, attribute) {
    // The case name is always going to be shown. Return true to avoid having
    // the case name appear twice.
    if (attribute.name === 'Case Name') {
      return true;
    }

    for (var i = 0; i < columns.length; i++) {
      if (columns[i].name === attribute.name) {
        return true;
      }
    }

    return false;
  };

  $scope.convertFacetName = function (facet_name) {
    // Rename file to source to keep things consistent.
    if (facet_name === 'file') {
      return 'Source';
    }

    // Replace underscores with spaces.
    var name = facet_name.replace(/_/g, " ");
    // Capitalize the first letter of each word.
    name = name.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    return name;
  };

  $scope.buildTooltip = function (highlights) {
    var tooltip = '';
    for (var i = 0; i < highlights.length; i++) {
      if (i + 1 < highlights.length) {
        tooltip += '<div style="border-bottom: 1px solid black;color: black;background: white">';
      } else {
        tooltip += '<div style="color: black;background: white">';
      }
      tooltip += highlights[i];
      tooltip += '</div>';
    }

    return tooltip;
  };

  $scope.initialize = function () {
    $scope.query = {
      'q': null,
      'page': 1,
      'logical_operator': null,
      'conditions': []
    };

    $http.get('/category_attributes/facetable.json').success(function (data) {
      angular.copy(data, $scope.attributes);
    });
  };

  $scope.initialize();
}]);

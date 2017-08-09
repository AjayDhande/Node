// Slightly modified version of http://jsfiddle.net/tUyyx/.
angular.module('laiApp').filter('truncate', function () {
  return function (text, length, suffix) {
    if (text == null) {
      return null;
    }

    if (isNaN(length)) {
      length = 10;
    }

    if (suffix === undefined) {
      suffix = "...";
    }

    if (text.length <= length || text.length - suffix.length <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length - suffix.length) + suffix;
    }
  };
});

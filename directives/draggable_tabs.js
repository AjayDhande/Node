angular.module('laiApp').directive('ngTabs', ['$q', '$timeout', function ($q, $timeout) {
  return {
    scope: true,
    link: function (scope, elm) {
      $timeout(function () {
        elm.tabs();

        elm.find(".ui-tabs-nav").sortable({
          axis: "x",
          stop: function () {
            var promise = elm.parent().scope().updateLayoutOrder();
            promise.then(function () {
//            elm.parent().scope().notifyCharts();
            }, function () {
              alert('failed');
            });
          }
        });

        $('.tabbable').removeClass('ui-corner-all ui-widget ui-widget-content ui-tabs ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-sortable');
        $('.tabbable > *').removeClass('ui-corner-all ui-widget ui-widget-content ui-widget-header ui-tabs ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-sortable');

      }, 0);

      var renameTab = function (obj) {
        var obj = $(obj),
          oldName = $(obj)[0].innerText.trim(),
          editMode = '<div class="editable"><form id="rename_tab_form"><input type="text" id="new_tab_name" value="' + oldName + '" name="new_tab_name" maxlength="20" /><button id="saveRename" class="btn btn-mini rename-tab-btn"><i class="icon-ok"></i></button><button id="cancelRename" class="btn btn-mini rename-tab-btn"><i class="icon-remove"></i></button></form></div>',
          form = $("#rename_tab_form");
        // Inject the form after the span, and then remove the span from DOM
        obj.after(editMode).remove();
        //We might not need this now, but it will be useful later when we add in validation
//        $("div.editable", ".nav-tabs").closest("a").addClass("editing");

        $("#new_tab_name").bind("focus",function () {
          this.select();
        }).focus();

        $("#saveRename").bind("click", function () {
          $("#rename_tab_form").submit();
          return false;
        });

        $("#cancelRename").bind("click", function () {
          replaceName(false, this, oldName);
          return false;
        });

        $("body").live("click", function (e) {
//          e.stopPropagation();
          var target = e.target.id;
          if (target == 'new_tab_name') {
            return false;
          } else if (target != 'cancelRename') {
            replaceName(false, $("#cancelRename"), oldName);
          }
          return false;
        });

        $("#rename_tab_form").bind("submit", function (e) {
          replaceName(true, $("#cancelRename"), $("#new_tab_name").val());
          e.preventDefault();
          return false;
        });
      };

      var replaceName = function (action, obj, val) {
        var name = '';

        if (action) { // If action is "true", we save the data
          // You could use the .ajax() method to save the data as you see fit
          if (elm.parent().scope()) {
            elm.parent().scope().renameLayout(val);
          } else {
            $('section div.tabbable').parent().scope().renameLayout(val);
          }
        } else {
          name = val;
        }

        if (val == '') {
          val = 'Untitled';
        }
        if (elm.parent().scope()) {
          elm.parent().scope().$apply(elm.parent().scope().isRename());
        } else {
          $('section div.tabbable').parent().scope().$apply($('section div.tabbable').parent().scope().isRename());
        }

        $(obj).parents("div.editable").after('<span>' + val + '</span>').remove();
        $("div.editable", ".nav-tabs").closest("a").removeClass("editing");
        $("#saveRename, #cancelRename").unbind();
        $('body').die();
      };

      $(".nav-tabs li.active a tab-heading span").livequery("click", function () {
        if (angular.element(this).scope()) {
          angular.element(this).scope().$parent.isRename();
          renameTab(this);
        }
      });

    }
  };
}]);
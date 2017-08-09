angular.module('laiApp').directive('flexpaper', function () {
  return function (scope, element, attrs) {
    scope.$watch("source", function () {
      if (attrs.fileName) { // fix for issue with attrs.fileName not loaded yet.
        jQuery.get((!window.isTouchScreen)?'/assets/UI_flexpaper_desktop.html':'/assets/UI_flexpaper_mobile.html',
          function(toolbarData) {
            $('#documentViewer').FlexPaperViewer(
              { config : {
                  jsDirectory: '/FlexPaper/',
                  PDFFile : attrs.fileName,
                  key : "",
                  Scale : 0.6,
                  ZoomTransition : 'easeOut',
                  ZoomTime : 0.5,
                  ZoomInterval : 0.2,
                  FitPageOnLoad : true,
                  FitWidthOnLoad : false,
                  FullScreenAsMaxWindow : false,
                  ProgressiveLoading : false,
                  MinZoomSize : 0.2,
                  MaxZoomSize : 5,
                  SearchMatchAll : false,

                  Toolbar         : toolbarData,
                  InitViewMode : 'Portrait',
                  RenderingOrder : 'html5,flash',
                  StartAtPage : '',

                  ViewModeToolsVisible : true,
                  ZoomToolsVisible : true,
                  NavToolsVisible : true,
                  CursorToolsVisible : true,
                  SearchToolsVisible : true,
                  WMode : 'window'
                  // localeChain: 'en_US'
              }}
            );
            // $('#documentViewer').removeAttr('file-name');
          })
        element.bind('onDocumentLoaded', function (e, totalPages) {
          scope.$eval(attrs.docLoaded)();
        });
      }
    })
  }
});

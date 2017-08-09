laiApp.service("PageService", function () {
  var title = "CMF";
  return {
    title:function () {
      return title;
    },
    setTitle:function (newTitle) {
      title = newTitle;
    }
  };
});

'use strict';

(function(module) {
  var aboutController = {};

  aboutController.index = () => {
    $('#about').show().siblings().hide();
    repos.requestRepos(repoView.index);
  };

  module.aboutController = aboutController;
})(window);

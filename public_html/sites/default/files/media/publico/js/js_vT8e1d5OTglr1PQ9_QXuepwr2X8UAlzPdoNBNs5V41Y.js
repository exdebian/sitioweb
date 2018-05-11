/**
 * @file
 * Drupal behaviours for baguetteBox module.
 */

(function ($) {

  Drupal.behaviors.baguettebox = {
    attach: function (context, settings) {
      baguetteBox.run('.baguettebox-container', {
        animation: settings.baguettebox.animation
      });
    }
  }

})(jQuery);
;
(function (Drupal, $) {
  "use strict";

  Drupal.behaviors.authcacheComment = {
    attach: function (context, settings) {
      if (settings.authcacheCommentNumNew) {
        $('.authcache-comment-num-new', context).once('authcache-comment-num-new', function() {
          var elem = $(this);
          var nid = elem.data('p13n-nid');
          if (settings.authcacheCommentNumNew[nid]) {
            elem.html(Drupal.formatPlural(settings.authcacheCommentNumNew[nid], '1 new comment', '@count new comments'));
          }
          else {
            elem.parent('li').hide();
          }
        });
      }

      if (settings.authcacheUser && settings.authcacheUser.uid) {
        $('.authcache-comment-edit', context).once('authcache-comment-edit', function() {
          var elem = $(this);
          if (elem.data('p13n-uid') == settings.authcacheUser.uid) {
            elem.show();
          }
          else {
            elem.hide();
          }
        });
      }
    }
  };

}(Drupal, jQuery));
;
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;
(function ($) {

/**
 * Automatically display the guidelines of the selected text format.
 */
Drupal.behaviors.filterGuidelines = {
  attach: function (context) {
    $('.filter-guidelines', context).once('filter-guidelines')
      .find(':header').hide()
      .closest('.filter-wrapper').find('select.filter-list')
      .bind('change', function () {
        $(this).closest('.filter-wrapper')
          .find('.filter-guidelines-item').hide()
          .siblings('.filter-guidelines-' + this.value).show();
      })
      .change();
  }
};

})(jQuery);
;
(function (Drupal, $) {
  "use strict";

  Drupal.behaviors.authcacheUser = {
    attach: function (context, settings) {
      if (settings.authcacheUser) {
        $('.authcache-user', context).once('authcache-user', function() {
          var $elem = $(this);
          var prop = $elem.data('p13n-user-prop');
          if (prop && settings.authcacheUser.hasOwnProperty(prop)) {
            if ($elem.is('input')) {
              $elem.val(settings.authcacheUser[prop]);
            }
            else {
              $elem.authcacheP13nReplaceWith(settings.authcacheUser[prop]);
            }
          }
        });
      }
    }
  };

}(Drupal, jQuery));
;
(function ($) {

Drupal.behaviors.qt_ui_tabs = {
  attach: function (context, settings) {

    $('.quicktabs-ui-wrapper').once('qt-ui-tabs-processed', function() {
      var id = $(this).attr('id');
      var qtKey = 'qt_' + id.substring(id.indexOf('-') +1);
      if (!settings.quicktabs[qtKey].history) {
        $(this).tabs();
      }
      else {
        $(this).tabs({event: 'change'});
        Drupal.quicktabsBbq($(this), 'ul.ui-tabs-nav a');
      }
    });

  }
}

})(jQuery);
;

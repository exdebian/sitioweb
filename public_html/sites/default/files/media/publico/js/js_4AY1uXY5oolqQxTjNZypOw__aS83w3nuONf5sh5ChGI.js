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
(function (Drupal, $) {
  "use strict";

  /**
   * Replace context nodes with given markup and call Drupal.detachBehaviors
   * and Drupal.attachBehaviors for old and new content respectively.
   */
  $.fn.authcacheP13nReplaceWith = function(markup) {
    return this.each(function() {
      if ($.type(markup) === 'array') {
        markup = Drupal.theme.apply({}, markup);
      }

      // The function jQuery.parseHTML is not yet present in v1.4.4. Also
      // parsing markup by feeding it directly into the jQuery function (e.g.
      // $(markup)) is impossible here, because if the input does not contain
      // any tags, jQuery will interpret it as selector. In order to work
      // around this problem, a dummy-element is created and then replaced
      // using the .html() function.
      var elem = $('<span>dummy</span>').html(markup).contents();

      $.each($(this).get(), function() {
        Drupal.detachBehaviors(this);
      });

      var old = $(this).replaceWith(elem);

      $.each(elem.get(), function() {
        Drupal.attachBehaviors(this);
      });
    });
  };

  /**
   * Merge new data into Drupal.settings and trigger the attach-behavior.
   */
  $.authcacheP13nMergeSetting = function(data) {
    $.extend(Drupal.settings, data);
    Drupal.attachBehaviors();
  };

  /**
   * Loop through settings structure and find referenced placeholder elements.
   * Invoke the callback with the context set to each element found.
   */
  $.fn.authcacheP13nEachElementInSettings = function(settings, callback) {
    // Fix integer keys introduced by array merge deep.
    $.each(settings || {}, function(selector) {
      $.each(this, function(fragment) {
        var group = this;
        if ($.type(group) === 'array') {
          var newgroup = {};
          $.each(this, function(wrongkey) {
            var realkey = group[wrongkey].param;
            newgroup[realkey] = group[wrongkey];
          });
          settings[selector][fragment] = newgroup;
        }
      });
    });

    return this.each(function() {
      var context = this;
      $.each(settings || {}, function(selector) {
        var fragsettings = this;

        $(selector, context).each(function() {
          var frag = $(this).data('p13n-frag');
          var param = $(this).data('p13n-param');

          if (fragsettings[frag] && fragsettings[frag][param]) {
            callback.call(this, fragsettings[frag][param], param, frag, selector, settings);
          }
        });
      });
    });
  };

  Drupal.behaviors.authcacheP13nFragments = {
    attach: function (context, settings) {
      $(context).authcacheP13nEachElementInSettings(settings.authcacheP13nFragments, function(markup) {
        $(this).authcacheP13nReplaceWith(markup);
      });
    }
  };

}(Drupal, jQuery));
;
(function (Drupal, $) {
  "use strict";

  var cache = {};
  var pending = {};
  var bustval = null;

  function authcacheGet(url, callback, type) {
    if (bustval !== $.cookie('aucp13n')) {
      cache = {};
      bustval = $.cookie('aucp13n');
    }
    if (cache.hasOwnProperty(url)) {
      callback(cache[url]);
    }
    else if (pending.hasOwnProperty(url)) {
      pending[url].push(callback);
    }
    else {
      pending[url] = [callback];

      $.ajax({
        url: url,
        data: {v: bustval},
        dataType: type,
        // Custom header to help prevent cross-site forgery requests.
        beforeSend: function(xhr) {
          xhr.setRequestHeader('X-Authcache','1');
        },
        success: function(data, status, xhr) {
          cache[url] = data;
          $.each(pending[url], function() {
            this(data);
          });
          delete pending[url];
        }
      });
    }
  }

  function authcacheGetJSON(url, callback) {
    return authcacheGet(url, callback, 'json');
  }

  // Simple Ajax fragment
  Drupal.behaviors.authcacheP13nAjaxFragments = {
    attach: function (context, settings) {
      if (settings.authcacheP13nAjaxFragments) {
        $.each(settings.authcacheP13nAjaxFragments, function(frag) {
          var params = this;
          $.each(params, function(url, param) {
            var $targets = $('.authcache-ajax-frag', context).filter(function () {
              // Use attr() instead of data() in order to prevent jQuery from
              // converting numeric strings to integers.
              return $(this).attr('data-p13n-frag') === frag && (!param || $(this).attr('data-p13n-param') === param);
            });
            if ($targets.length) {
              authcacheGet(url, function(markup) {
                $targets.each(function() {
                  $(this).authcacheP13nReplaceWith(markup);
                });
              });
            }
          });
        });
      }
    }
  };

  // Ajax settings
  Drupal.behaviors.authcacheP13nAjaxSettings = {
    attach: function (context, settings) {
      if (settings.authcacheP13nAjaxSettings) {
        $.each(settings.authcacheP13nAjaxSettings, function() {
          var url = this;
          authcacheGetJSON(url, function(data) {
            $.authcacheP13nMergeSetting(data);
          });
        });

        // Remove the urls we processed
        settings.authcacheP13nAjaxSettings = [];
      }
    }
  };

  // Ajax fragment assembly
  Drupal.behaviors.authcacheP13nAjaxAssemblies = {
    attach: function (context, settings) {
      if (settings.authcacheP13nAjaxAssemblies) {
        $.each(settings.authcacheP13nAjaxAssemblies, function(selector) {
          var targets = $(selector, context);
          var url = this;
          if (targets.length) {
            authcacheGetJSON(url, function(data) {
              var response = {};
              response[selector] = data;

              $(context).authcacheP13nEachElementInSettings(response, function(markup) {
                $(this).authcacheP13nReplaceWith(markup);
              });
            });
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

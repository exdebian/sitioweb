(function ($, Drupal) {

  Drupal.BootstrapPassword = function (element) {
    var self = this;
    var $element = $(element);
    this.settings = Drupal.settings.password;
    this.$wrapper = $element.parent().parent();
    this.$row = $('<div class="row">').prependTo(this.$wrapper);

    // The password object.
    this.password = {
      $input: $element,
      $label: $element.parent().find('label'),
      $wrapper: $element.parent().addClass('col-sm-6 col-md-4 has-feedback').appendTo(self.$row)
    };
    this.password.$icon = $('<span class="glyphicon form-control-feedback"></span>').appendTo(this.password.$wrapper);

    // Strength meter.
    this.strength = {
      $label: $('<div class="label" aria-live="assertive"></div>').appendTo(this.password.$label),
      $progress: $('<div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>').appendTo(this.password.$wrapper)
    };
    this.strength.$bar = this.strength.$progress.find('.progress-bar');

    // The confirmation object.
    this.confirm = {
      $input: this.$wrapper.find('input.password-confirm')
    };
    this.confirm.$wrapper = this.confirm.$input.parent().addClass('col-sm-6 col-md-4 has-feedback').appendTo(self.$row);
    this.confirm.$icon = $('<span class="glyphicon form-control-feedback"></span>').appendTo(this.confirm.$wrapper);

    // Bind events.
    this.password.$input.on('keyup focus blur', function () {
      self.validateStrength();
    });
    this.confirm.$input.on('keyup blur', function () {
      self.validateMatch();
    });

    // Add password help at the of row.
    this.$helpBlock = $('<div class="help-block password-help"></div>').appendTo(this.$row);

    return this;
  };

  /**
   * Helper method to switch classes on elements based on status.
   *
   * @param {jQuery} $element
   *   The jQuery element to modify.
   * @param {string} type
   *   The name of the class to switch to. Can be one of: "danger", "info",
   *   "success" or "warning".
   * @param {string} prefix
   *   The prefix to use. Typically this would be something like "label" or
   *   "progress-bar".
   */
  Drupal.BootstrapPassword.prototype.switchClass = function ($element, type, prefix) {
    prefix = prefix + '-' || '';
    var types = prefix === 'has-' ? ['error', 'warning', 'success'] : ['danger', 'info', 'success', 'warning'];
    if (type) {
      type = types.splice($.inArray(type, types), 1).shift();
      $element.addClass(prefix + type);
    }
    $element.removeClass(prefix + types.join(' ' + prefix));
  };

  /**
   * Validates the strength of a password.
   */
  Drupal.BootstrapPassword.prototype.validateStrength = function () {
    var result = Drupal.evaluatePasswordStrength(this.password.$input.val(), Drupal.settings.password);

    // Ensure visibility.
    this.$helpBlock.show();
    this.strength.$label.show();
    this.strength.$bar.show();

    // Update the suggestions for how to improve the password.
    this.$helpBlock.html(result.message);

    // Only show the description box if there is a weakness in the password.
    this.$helpBlock[result.strength === 100 ? 'hide' : 'show']();

    // Update the strength indication text.
    this.strength.$label.html(result.indicatorText);

    // Adjust the length of the strength indicator.
    this.strength.$bar.attr('aria-valuenow', result.strength);
    this.strength.$bar.css('width', result.strength + '%');

    // Change the classes (color) of the strength meter based on result level.
    switch (result.indicatorText) {
      case this.settings.weak:
        this.switchClass(this.password.$wrapper, 'error', 'has');
        this.switchClass(this.strength.$label, 'danger', 'label');
        this.switchClass(this.strength.$bar, 'danger', 'progress-bar');
        this.password.$icon.addClass('glyphicon-remove').removeClass('glyphicon-warning-sign glyphicon-ok');
        break;

      case this.settings.fair:
      case this.settings.good:
        this.switchClass(this.password.$wrapper, 'warning', 'has');
        this.switchClass(this.strength.$label, 'warning', 'label');
        this.switchClass(this.strength.$bar, 'warning', 'progress-bar');
        this.password.$icon.addClass('glyphicon-warning-sign').removeClass('glyphicon-remove glyphicon-ok');
        break;

      case this.settings.strong:
        this.switchClass(this.password.$wrapper, 'success', 'has');
        this.switchClass(this.strength.$label, 'success', 'label');
        this.switchClass(this.strength.$bar, 'success', 'progress-bar');
        this.password.$icon.addClass('glyphicon-ok').removeClass('glyphicon-warning-sign glyphicon-remove');
        break;
    }
    this.validateMatch();
  };

  /**
   * Validates both original and confirmation passwords to ensure they match.
   */
  Drupal.BootstrapPassword.prototype.validateMatch = function () {
    var password = this.password.$input.val();

    // Passwords match.
    if (password && password === this.confirm.$input.val()) {
      this.switchClass(this.password.$wrapper, 'success', 'has');
      this.switchClass(this.confirm.$wrapper, 'success', 'has');
      this.$helpBlock.hide();
      this.strength.$label.hide();
      this.strength.$bar.hide();
      this.password.$icon.addClass('glyphicon-ok').removeClass('glyphicon-warning-sign glyphicon-remove');
      this.confirm.$icon.addClass('glyphicon-ok').removeClass('glyphicon-remove');
    }
    // Passwords do not match.
    else if (password) {
      this.switchClass(this.confirm.$wrapper, 'error', 'has');
      this.confirm.$icon.addClass('glyphicon-remove').removeClass('glyphicon-ok');
    }
    // No password.
    else {
      this.confirm.$icon.removeClass('glyphicon-ok glyphicon-remove');
      this.confirm.$input.val('');
      this.switchClass(this.confirm.$wrapper, '', 'has');
    }
  };

  /**
   * Overrides core JS for password strength and confirmation.
   *
   * Attach handlers to evaluate the strength of any password fields and to check
   * that its confirmation is correct.
   */
  Drupal.behaviors.password = {
    attach: function (context) {
      $('input.password-field', context).once('password', function () {
        new Drupal.BootstrapPassword(this);
      });
    }
  };

})(jQuery, window.Drupal);
;
(function ($) {

/**
 * Override Views prototype function so it can recognize Bootstrap AJAX pagers.
 * Attach the ajax behavior to each link.
 */
Drupal.views.ajaxView.prototype.attachPagerAjax = function() {
  this.$view.find('ul.pager > li > a, th.views-field a, .attachment .views-summary a, ul.pagination li a')
  .each(jQuery.proxy(this.attachPagerLinkAjax, this));
};

})(jQuery);
;
(function ($) {

  function updateFilterHelpLink () {
    var $link = $(this).parents('.filter-wrapper').find('.filter-help > a');
    var originalLink = $link.data('originalLink');
    if (!originalLink) {
      originalLink = $link.attr('href');
      $link.data('originalLink', originalLink);
    }
    $link.attr('href', originalLink + '/' + $(this).find(':selected').val());
  }

  $(document).on('change', '.filter-wrapper select.filter-list', updateFilterHelpLink);

  /**
   * Override core's functionality.
   */
  Drupal.behaviors.filterGuidelines = {
    attach: function (context) {
      $(context).find('.filter-wrapper select.filter-list').once('filter-list', updateFilterHelpLink);
    }
  };

})(jQuery);
;
(function ($) {

/**
 * Override Drupal's AJAX prototype beforeSend function so it can append the
 * throbber inside the pager links.
 */
Drupal.ajax.prototype.beforeSend = function (xmlhttprequest, options) {
  // For forms without file inputs, the jQuery Form plugin serializes the form
  // values, and then calls jQuery's $.ajax() function, which invokes this
  // handler. In this circumstance, options.extraData is never used. For forms
  // with file inputs, the jQuery Form plugin uses the browser's normal form
  // submission mechanism, but captures the response in a hidden IFRAME. In this
  // circumstance, it calls this handler first, and then appends hidden fields
  // to the form to submit the values in options.extraData. There is no simple
  // way to know which submission mechanism will be used, so we add to extraData
  // regardless, and allow it to be ignored in the former case.
  if (this.form) {
    options.extraData = options.extraData || {};

    // Let the server know when the IFRAME submission mechanism is used. The
    // server can use this information to wrap the JSON response in a TEXTAREA,
    // as per http://jquery.malsup.com/form/#file-upload.
    options.extraData.ajax_iframe_upload = '1';

    // The triggering element is about to be disabled (see below), but if it
    // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
    // value is included in the submission. As per above, submissions that use
    // $.ajax() are already serialized prior to the element being disabled, so
    // this is only needed for IFRAME submissions.
    var v = $.fieldValue(this.element);
    if (v !== null) {
      options.extraData[this.element.name] = v;
    }
  }

  var $element = $(this.element);

  // Disable the element that received the change to prevent user interface
  // interaction while the Ajax request is in progress. ajax.ajaxing prevents
  // the element from triggering a new request, but does not prevent the user
  // from changing its value.
  $element.addClass('progress-disabled').attr('disabled', true);

  // Insert progressbar or throbber.
  if (this.progress.type == 'bar') {
    var progressBar = new Drupal.progressBar('ajax-progress-' + this.element.id, eval(this.progress.update_callback), this.progress.method, eval(this.progress.error_callback));
    if (this.progress.message) {
      progressBar.setProgress(-1, this.progress.message);
    }
    if (this.progress.url) {
      progressBar.startMonitoring(this.progress.url, this.progress.interval || 500);
    }
    this.progress.element = $(progressBar.element).addClass('ajax-progress ajax-progress-bar');
    this.progress.object = progressBar;
    if (!$element.closest('.file-widget,.form-item').length) {
      $element.before(this.progress.element);
    }
    else {
      $element.closest('.file-widget,.form-item').after(this.progress.element);
    }
  }
  else if (this.progress.type == 'throbber') {
    this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><i class="glyphicon glyphicon-refresh glyphicon-spin"></i></div>');
    if (this.progress.message) {
      $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
    }

    // If element is an input type, append after.
    if ($element.is('input')) {
      $element.after(this.progress.element);
    }
    else if ($element.is('select')) {
      var $inputGroup = $element.closest('.form-item').find('.input-group-addon, .input-group-btn');
      if (!$inputGroup.length) {
        $element.wrap('<div class="input-group">');
        $inputGroup = $('<span class="input-group-addon">');
        $element.after($inputGroup);
      }
      $inputGroup.append(this.progress.element);
    }
    // Otherwise append the throbber inside the element.
    else {
      $element.append(this.progress.element);
    }
  }
};

})(jQuery);
;
(function($) {
  // Unbind core state.js from document first so we can then override below.
  $(document).unbind('state:disabled');

  /**
   * Global state change handlers. These are bound to "document" to cover all
   * elements whose state changes. Events sent to elements within the page
   * bubble up to these handlers. We use this system so that themes and modules
   * can override these state change handlers for particular parts of a page.
   */
  $(document).bind('state:disabled', function(e) {
    // Only act when this change was triggered by a dependency and not by the
    // element monitoring itself.
    if (e.trigger) {
      $(e.target)
        .attr('disabled', e.value)
        .closest('.form-item, .form-submit, .form-wrapper').toggleClass('form-disabled', e.value)
        .find(':input').attr('disabled', e.value);

      // Note: WebKit nightlies don't reflect that change correctly.
      // See https://bugs.webkit.org/show_bug.cgi?id=23789
    }
  });
})(jQuery);
;

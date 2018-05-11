(function ($) {
  // Override core JS so it works with "button" tags.
  /**
   * Attach behaviors to the file upload and remove buttons.
   */
  Drupal.behaviors.fileButtons = {
    attach: function (context) {
      $(':input.form-submit', context).bind('mousedown', Drupal.file.disableFields);
      $('div.form-managed-file :input.form-submit', context).bind('mousedown', Drupal.file.progressBar);
    },
    detach: function (context) {
      $(':input.form-submit', context).unbind('mousedown', Drupal.file.disableFields);
      $('div.form-managed-file :input.form-submit', context).unbind('mousedown', Drupal.file.progressBar);
    }
  };
  if (Drupal.file) {
    /**
     * Prevent file uploads when using buttons not intended to upload.
     */
    Drupal.file.disableFields = function (event){
      var clickedButton = this;

      // Only disable upload fields for Ajax buttons.
      if (!$(clickedButton).hasClass('ajax-processed')) {
        return;
      }

      // Check if we're working with an "Upload" button.
      var $enabledFields = [];
      if ($(this).closest('div.form-managed-file').length > 0) {
        $enabledFields = $(this).closest('div.form-managed-file').find(':input.form-file');
      }

      // Temporarily disable upload fields other than the one we're currently
      // working with. Filter out fields that are already disabled so that they
      // do not get enabled when we re-enable these fields at the end of behavior
      // processing. Re-enable in a setTimeout set to a relatively short amount
      // of time (1 second). All the other mousedown handlers (like Drupal's Ajax
      // behaviors) are excuted before any timeout functions are called, so we
      // don't have to worry about the fields being re-enabled too soon.
      // @todo If the previous sentence is true, why not set the timeout to 0?
      var $fieldsToTemporarilyDisable = $('div.form-managed-file :input.form-file').not($enabledFields).not(':disabled');
      $fieldsToTemporarilyDisable.attr('disabled', 'disabled');
      setTimeout(function (){
        $fieldsToTemporarilyDisable.attr('disabled', false);
      }, 1000);
    };
    /**
     * Add progress bar support if possible.
     */
    Drupal.file.progressBar = function (event) {
      var clickedButton = this;
      var $progressId = $(clickedButton).closest('div.form-managed-file').find(':input.file-progress');
      if ($progressId.length) {
        var originalName = $progressId.attr('name');

        // Replace the name with the required identifier.
        $progressId.attr('name', originalName.match(/APC_UPLOAD_PROGRESS|UPLOAD_IDENTIFIER/)[0]);

        // Restore the original name after the upload begins.
        setTimeout(function () {
          $progressId.attr('name', originalName);
        }, 1000);
      }
      // Show the progress bar if the upload takes longer than half a second.
      setTimeout(function () {
        $(clickedButton).closest('div.form-managed-file').find('div.ajax-progress-bar').slideDown();
      }, 500);
    };

    /**
     * Styling invalid file extension error message (Issue #2331595 by NetTantra).
     */
    Drupal.file.validateExtension = function (event) {
      // Remove any previous errors.
      $('.file-upload-js-error').remove();

      // Add client side validation for the input[type=file].
      var extensionPattern = event.data.extensions.replace(/,\s*/g, '|');
      if (extensionPattern.length > 1 && this.value.length > 0) {
        var acceptableMatch = new RegExp('\\.(' + extensionPattern + ')$', 'gi');
        if (!acceptableMatch.test(this.value)) {
          var error = Drupal.t("The selected file %filename cannot be uploaded. Only files with the following extensions are allowed: %extensions.", {
            // According to the specifications of HTML5, a file upload control
            // should not reveal the real local path to the file that a user
            // has selected. Some web browsers implement this restriction by
            // replacing the local path with "C:\fakepath\", which can cause
            // confusion by leaving the user thinking perhaps Drupal could not
            // find the file because it messed up the file path. To avoid this
            // confusion, therefore, we strip out the bogus fakepath string.
            '%filename': this.value.replace('C:\\fakepath\\', ''),
            '%extensions': extensionPattern.replace(/\|/g, ', ')
          });
          $(this).closest('div.form-managed-file').parents('.form-item').first().prepend('<div class="alert alert-danger alert-dismissible messages error file-upload-js-error" aria-live="polite" role="alert">\
            <button type="button" class="close" data-dismiss="alert">\
              <span aria-hidden="true">&times;</span>\
              <span class="sr-only">Close</span>\
            </button>' + error + '</div>');
          this.value = '';
          return false;
        }
      }
    };
  }
})(jQuery);
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

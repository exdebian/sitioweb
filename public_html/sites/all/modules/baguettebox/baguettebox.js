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

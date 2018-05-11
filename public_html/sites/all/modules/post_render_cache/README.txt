Post Render Cache
-----------------
This module allows post processing of render arrays just after them
being retrieved from cache. It allows you to apply small per-user modifications
on globally cached output, without having to resort to per-user caching.

Think of it as a poor man's ESI, or the same thing than #post_render callbacks,
except they will run at drupal_process_attached() time at initial rendering
and after drupal_render_cache_get().

Usage
-----
This is a module for developers, it expects you to alter your code.

After installing the module, add the function "post_render_cache_pre_render"
in the #pre_render key of the render array. Then add an array of callbacks under
the #post_render_cache key.

The #post_render cache key and callbacks will have the same syntax than the
standard #post_render callbacks. For more info see https://www.drupal.org/node/930760

Example
-------

function my_module_render() {
  $render_array = [
    '#markup' => 'Hello [user:name]',  // Will output the logged-in user name
    '#cache' => [
      'cid' => 'my_module_cache_key',
      'expire' => CACHE_TEMPORARY,
    ],
    '#post_render_cache' => [  // List of callbacks to run every single time
      'my_module_post_render_cache',
    ],
  ];

  $render_array = element_info('markup');

  $render_array['#pre_render'][] = 'post_render_cache_pre_render';  // Enable post_render_cache


  return drupal_render($render_array);
}

/**
 * Replaces the token with the current use name.
 */
function my_module_post_render_cache($output, $elements) {
  global $user;
  $context = ['user' => $user];
  return token_replace($output, $context);
}
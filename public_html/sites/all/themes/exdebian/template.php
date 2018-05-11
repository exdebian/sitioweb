<?php
/**
 * @file
 * The primary PHP file for this theme.
 */
/**
* Preprocesses the wrapping HTML.
*
* @param array &$vars
*   Template variables.
* para sacar la | que separa el nombre 
* del sitio con el de la página
* en la pestaña del navegador
*/
function exdebian_preprocess_html(&$vars) {
  $vars['head_title'] = str_replace("|", "  ", $vars['head_title']);
}

<?php

/*
   This file is part of Visual Chap.

   Visual Chap is free software: you can redistribute it and/or modify
   it under the terms of the wonderful GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   any later version.
   
   Visual Chap is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with Visual Chap. If not, see https://www.gnu.org/licenses/gpl-3.0.html .
*/

// block direct access to plugin PHP files
defined( 'ABSPATH' ) or die( 'Nope: stop script kiddies, please!' );

// if uninstall.php is not called by WordPress, die
if ( ! defined('WP_UNINSTALL_PLUGIN') ) {
    die;
}

if ( is_admin() && current_user_can('manage_options') ){
    // delete all options
    delete_option('wikipedia-visual-chap-options-icon-color');
    delete_option('wikipedia-visual-chap-options-color');
    delete_option('wikipedia-visual-chap-options-background-color');
    delete_option('wikipedia-visual-chap-options-underline-color');
    delete_option('wikipedia-visual-chap-options-link-color');
    delete_option('wikipedia-visual-chap-options-margin-top');
    delete_option('wikipedia-visual-chap-options-words-filter');
    delete_option('wikipedia-visual-chap-options-wiki-donate');
    delete_option('wikipedia-visual-chap-options-dev');
}
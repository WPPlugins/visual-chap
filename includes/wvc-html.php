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

// add html elements to page
function wikipedia_visual_chap_main_html( $content ){


    // extended form for HTML var 'wvcHTMLInject' - html changes accordingly to 'show dev support' option (no logo, empty title)
/*
    <!-- Wikipedia Visual Chap START -->
    <div id="wikipedia-visual-chap-box" class="wvc-box-standby">
	<div id="wikipedia-visual-chap-inner-container">
	    <div id="wikipedia-visual-chap-box-switch" class="wvc-switch-standby">
		<i class="fa fa-info-circle" aria-hidden="true"></i>
	    </div>
	    <p class="wikipedia-visual-chap-standby-item">Wikipedia Visual Chap</p>
	    <p class="wikipedia-visual-chap-standby-item">
		<?php
		echo __('Click words or select text to get a quick link, a description and a picture from that Wikipedia<sup>&reg</sup> entry', 'wikipedia-visual-chap');
		?>
	    </p>
	    <div class="wikipedia-visual-chap-standby-item" id="wikipedia-visual-chap-display">
		<div class="wvc-loading-image-standby" id="wikipedia-visual-chap-img-loading">
		    <i class="fa fa-circle-o-notch fa-3x" aria-hidden="true"></i>
		</div>
		<a id="wikipedia-visual-chap-display-title-link" href="" target="_blank">
		    <h3 id="wikipedia-visual-chap-display-title"></h3>
		</a>
		<p class="wikipedia-visual-chap-standby-item" id="wikipedia-visual-chap-display-description"></p>
		<img class="wvc-img-standby" id="wikipedia-visual-chap-display-image" alt="" src=""/>
	    </div>
	</div>
    </div><!-- Wikipedia Visual Chap END -->
*/

    // print logo
    function wikipedia_visual_chap_print_logo(){
        $wvc_logo_option = '';
        // show support options
        $wvc_show_credits_options_dev = get_option('wikipedia-visual-chap-options-dev', 0);
        if ( $wvc_show_credits_options_dev == 1){
            $wvc_logo_option = '<img id="wikipedia-visual-chap-box-logo" src="' . esc_url(plugins_url() . '/visual-chap/assets/img/Visual_Chap_logo.png') . '" alt="visual chap logo"></img><i class="fa fa-info-circle" aria-hidden="true"></i></div><p id="wikipedia-visual-chap-name" class="wikipedia-visual-chap-standby-item">Visual Chap</p>';
        }
        else {
            $wvc_logo_option = '<i class="fa fa-info-circle" aria-hidden="true"></i></div><p id="wikipedia-visual-chap-name" class="wikipedia-visual-chap-standby-item"></p>';
        }
        return $wvc_logo_option;
    }
        $wikipedia_visual_chap_print_logo = wikipedia_visual_chap_print_logo();

    // print credit footer items
    function wikipedia_visual_chap_print_credits(){
        $wvc_credits_option = '';
        // show support options
        $wvc_show_credits_options_wiki = get_option('wikipedia-visual-chap-options-wiki-donate', 0);
        $wvc_show_credits_options_dev = get_option('wikipedia-visual-chap-options-dev', 0);
        if ( $wvc_show_credits_options_wiki == 1 ){
            $wvc_credits_option .= "<div class='wikipedia-visual-chap-standby-item wikipedia-visual-chap-link-wiki-donate'><p class='wikipedia-visual-chap-standby-item'>Wikipedia is awesome. \r\n<a href='https://wikimediafoundation.org/wiki/Ways_to_Give' target='_blank'>Be awesome</a> to Wikipedia</p></div>";
        }
        if ( $wvc_show_credits_options_dev == 1){
            $wvc_credits_option .= '<div class="wikipedia-visual-chap-standby-item wikipedia-visual-chap-link-dev"><p class="wikipedia-visual-chap-standby-item">Developed for you with lots of love and dedication by <a href="http://ypower.nouveausiteweb.fr/" target="_blank">_Y_Power</a></p></div>';
        }
        return $wvc_credits_option;
    }
    $wikipedia_visual_chap_print_credits = wikipedia_visual_chap_print_credits();
    
    // main html injection var
    $wvcHTMLInject = '<!-- Wikipedia Visual Chap START --><div id="wikipedia-visual-chap-box" class="wvc-box-standby"><div id="wikipedia-visual-chap-inner-container"><div id="wikipedia-visual-chap-box-switch" class="wvc-switch-standby">' . $wikipedia_visual_chap_print_logo . '<p class="wikipedia-visual-chap-standby-item">' . __('Click words or select text to get a quick link, a description and a picture from that Wikipedia<sup>&reg</sup> entry: click on pictures to see their license details', 'wikipedia-visual-chap') . '</p><div class="wikipedia-visual-chap-standby-item" id="wikipedia-visual-chap-display"><div class="wvc-loading-image-standby" id="wikipedia-visual-chap-img-loading"><i class="fa fa-circle-o-notch fa-3x" aria-hidden="true"></i></div><a id="wikipedia-visual-chap-display-title-link" href="" target="_blank"><h3 id="wikipedia-visual-chap-display-title"></h3></a><p class="wikipedia-visual-chap-standby-item" id="wikipedia-visual-chap-display-description"></p><img class="wvc-img-standby" id="wikipedia-visual-chap-display-image" alt="" src=""/>' . $wikipedia_visual_chap_print_credits . '</div></div></div><!-- Wikipedia Visual Chap END -->' . $content;

    return $wvcHTMLInject;
    
}


?>

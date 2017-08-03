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

(function(){

    var jQ = jQuery.noConflict();

    /* document ready START */
    jQ(document).ready(function(){

	/* margin top real-time display */
	jQ('input#wikipedia-visual-chap-section-main-margin-top').on('input', function(){
	    var wvc_margin_control = jQ('input#wikipedia-visual-chap-section-main-margin-top').attr('value');
	    jQ('span#wikipedia-visual-chap-admin-margin-top').html(wvc_margin_control);
	});
	
    });
    /* document ready END */

})();

<?php 
/*
   Plugin Name: Visual Chap
   Plugin URI:  http://visualchap.nouveausiteweb.fr/
   Description: Enriches your posts by adding a quick, 'visual' Wikipedia-powered search.
   Version:     1.0.5
   Author:      _y_power
   Author URI:  http://ypower.nouveausiteweb.fr/
   License:     GPL3
   icense URI: https://www.gnu.org/licenses/gpl-3.0.html
   Text Domain: wikipedia-visual-chap
   Domain Path: /languages

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

// get languages files
load_plugin_textdomain('wikipedia-visual-chap', false, basename( dirname( __FILE__ ) ) . '/languages' );


// main class
if ( ! class_exists( 'Wikipedia_Visual_Chap' ) ) {
    class Wikipedia_Visual_Chap
{
	private $wvc_options;
	private $wvc_default_values;
	/**
	 * Constructor
	 */
	public function __construct() {
        // launch
        add_action( 'wp_enqueue_scripts', array( $this, 'register_files' ) );
        // if front-end
        if ( ! is_admin() ){
            add_action( 'loop_start', array( $this, 'launcher' ) );
        }
        // if back-end
        else {
            add_action( 'wp_loaded', array( $this, 'admin_panel' ) );
        }
	}

    // register files
    public function register_files() {
        if ( is_admin() ){
            // admin css
            wp_register_style( 'wikipedia-visual-chap-admin', plugins_url() .  '/visual-chap/includes/css/wikipedia-visual-chap-admin.css' );
            // admin js
            wp_register_script( 'wikipedia-visual-chap-admin-js',  plugins_url() .  '/visual-chap/includes/js/wikipedia-visual-chap-admin.js', array('jquery') );
        }
        else {
            // css
            wp_register_style( 'wikipedia-visual-chap-icons', plugins_url() . '/visual-chap/assets/font-awesome-4.7.0/css/font-awesome.min.css' ); // "Font Awesome by Dave Gandy - http://fontawesome.io"
            wp_register_style( 'wikipedia-visual-chap-main', plugins_url() .  '/visual-chap/includes/css/wikipedia-visual-chap.css' );
            // js
            wp_register_script( 'wikipedia-visual-chap-main-js',  plugins_url() .  '/visual-chap/includes/js/wikipedia-visual-chap.js', array('jquery') );            
            // options array for JS - front only
            $wvc_wp_options_array = array(
                'wvcIconColor' => get_option('wikipedia-visual-chap-options-icon-color', '#CBC7C7'),
                'wvcColor' => get_option('wikipedia-visual-chap-options-color', '#292929'),
                'wvcBackgroundColor' => get_option('wikipedia-visual-chap-options-background-color', '#fff'),
                'wvcUnderlineColor' => get_option('wikipedia-visual-chap-options-underline-color', '#FF0000'),
                'wvcLinkColor' => get_option('wikipedia-visual-chap-options-link-color', '#5675E1'),
                'wvcMarginTop' => get_option('wikipedia-visual-chap-options-margin-top', 45),
                'wvcWordsFilter' => get_option('wikipedia-visual-chap-options-words-filter', ''),
                'wvcWikiLink' => get_option('wikipedia-visual-chap-options-wiki-donate', 0),
                'wvcDevLink' => get_option('wikipedia-visual-chap-options-dev', 0),
                'wvcPluginsURL' => plugins_url()
            );
            // export options to JS
            wp_localize_script( 'wikipedia-visual-chap-main-js', 'WVCWPOptions', $wvc_wp_options_array );
        }
    }

    // main launcher
    public function launcher() {
        // conditional checks - add all checks here
        if ( is_single() ){
            require_once dirname( __FILE__ ) . '/includes/wvc-html.php';
            // css
            wp_enqueue_style( 'wikipedia-visual-chap-icons' ); // "Font Awesome by Dave Gandy - http://fontawesome.io"
            wp_enqueue_style( 'wikipedia-visual-chap-main' );
            // js
            wp_enqueue_script( 'wikipedia-visual-chap-main-js' );
            // content filter
            add_filter( 'the_content', 'wikipedia_visual_chap_main_html' );
        }
    }

	// admin files
	public function wikipedia_visual_chap_admin_files(){
        if ( is_admin() ){
            // admin css
            wp_register_style( 'wikipedia-visual-chap-admin', plugins_url() .  '/visual-chap/includes/css/wikipedia-visual-chap-admin.css' );
            // admin js
            wp_register_script( 'wikipedia-visual-chap-admin-js',  plugins_url() .  '/visual-chap/includes/js/wikipedia-visual-chap-admin.js', array('jquery') );
        }
	}

	// create page
	public function wikipedia_visual_chap_settings_page(){
        // if user is NOT allowed
        if ( ! current_user_can('manage_options') ) {
            wp_die( esc_html__('You do not have sufficient permissions to access this page.', 'wikipedia-visual-chap') );
        }
        // create options page
        add_options_page( 'Visual Chap settings', 'Visual Chap', 'manage_options', 'wikipedia-visual-chap-settings', array($this, 'wikipedia_visual_chap_admin_html') );
	}

	// add html elements to admin screen
	public function wikipedia_visual_chap_admin_html(){
            if ( is_admin() ){
		if ( ! current_user_can('manage_options') ) {
                    wp_die( esc_html__('You do not have sufficient permissions to access this page.', 'wikipedia-visual-chap') );
		}
        // admin css
        wp_enqueue_style( 'wikipedia-visual-chap-admin' );
        // admin js
        wp_enqueue_script( 'wikipedia-visual-chap-admin-js' );
?>
<div id="wikipedia-visual-chap-admin-box" class="wrap">
    <h1><?php echo esc_attr__('Visual Chap', 'wikipedia-visual-chap');?></h1>
    <p>
	<?php esc_html_e('Thank you for using Visual Chap, the smart, graphical companion for your posts! ', 'wikipedia-visual-chap');
        ?>
	<img id="wikipedia-visual-chap-admin-logo" src="<?php echo esc_url(plugins_url() . '/visual-chap/assets/img/Visual_Chap_logo.png'); ?>" alt="Visual Chap logo"></img>
    </p>
    <p>
	<?php esc_html_e('An icon will now be displayed at the right of your WordPress posts content: clicking on that icon -which will also \'scroll\' , following your reader\'s window\'s position- will toggle all Visual Chap functionalities. Once active, your visitors will be able to click on words AND/OR select text from your content and Visual Chap will quickly query Wikipedia servers and display the results, always striving to obtain the best and most accurate picture available.', 'wikipedia-visual-chap'); ?>
    </p>
    <p>
	<?php esc_html_e('Visual Chap will be ONLY ACTIVE IN "EMPTY" PARAGRAPHS - which means it will bypass a particular paragraph if it finds there are already links in it: when active, it is always possible to trigger the search by selecting text. Find more info on the ', 'wikipedia-visual-chap'); ?>
	<a style="text-decoration: none;" href="<?php echo esc_url('http://visualchap.nouveausiteweb.fr/'); ?>" alt="<?php echo esc_attr__('wikipedia visual chap official website', 'wikipedia-visual-chap'); ?>" target="_blank"><?php echo esc_attr__('official website', 'wikipedia-visual-chap'); ?></a>.
    </p>
    <p>Visual Chap<sup>&reg</sup> and its logo are registered trademarks of _Y_ Power.</p>
    <p>Wikipedia<sup>&reg</sup> and the Wikipedia logos are registered trademarks of the Wikimedia Foundation.</p>
    <p>
	<?php esc_html_e('Wikipedia is awesome: ', 'wikipedia-visual-chap'); ?>
	<a style="text-decoration: none;" href="<?php echo esc_url('https://wikimediafoundation.org/wiki/Ways_to_Give'); ?>" alt="<?php echo esc_attr__('wikipedia visual chap official website', 'wikipedia-visual-chap'); ?>" target="_blank"><?php echo esc_attr__('be awesome', 'wikipedia-visual-chap'); ?></a>
	<?php esc_html_e(' to Wikipedia!', 'wikipedia-visual-chap'); ?>
    </p>
    <div id="wikipedia-visual-chap-admin-dev-container">
	<p id="wikipedia-visual-chap-admin-dev-p">
	    <?php esc_html_e('Developed with love by ', 'wikipedia-visual-chap'); ?>
	</p>
	<a style="text-decoration: none;" href="<?php echo esc_url('http://ypower.nouveausiteweb.fr/'); ?>" alt="<?php echo esc_attr__('Y power\'s website', 'wikipedia-visual-chap'); ?>" target="_blank"><img id="wikipedia-visual-chap-admin-dev-logo" src="<?php echo esc_attr( plugins_url() . '/visual-chap/assets/img/y_power_logo.png' ) ?>"></img></a>
    </div>
    <form method="post" action="options.php">
	<?php
	settings_fields('wvc_options');
	do_settings_sections('wikipedia_visual_chap');
	submit_button( __('Save changes', 'wikipedia-visual-chap') );
	?>
    </form>
</div>
<?php }
else {?>
    <div class="wikipedia-visual-chap-not-authorized"><h3><?php esc_html_e('You are not authorized to see this page.', 'wikipedia-visual-chap'); ?></h3></div>
<?php }
}

// register settings and validate inputs
public function wikipedia_visual_chap_settings_setup(){

    // if options are NOT present (first launch)
    if ( false ==  get_option('wikipedia-visual-chap-options-color') ){
        update_option('wikipedia-visual-chap-options-icon-color', '#CBC7C7');
        update_option('wikipedia-visual-chap-options-color', '#292929');
        update_option('wikipedia-visual-chap-options-background-color', '#fff');
        update_option('wikipedia-visual-chap-options-underline-color', '#FF0000');
        update_option('wikipedia-visual-chap-options-link-color', '#5675E1');
        update_option('wikipedia-visual-chap-options-margin-top', 45);
        update_option('wikipedia-visual-chap-options-words-filter', '');
        update_option('wikipedia-visual-chap-options-wiki-donate', 0);
        update_option('wikipedia-visual-chap-options-dev', 0);
    }

    
    //VALIDATION
    
    // validate hex
    function wikipedia_visual_chap_hex_validate($wvc_options){
        $wikipedia_visual_chap_color_newinput = trim($wvc_options);
        if ( ! preg_match('/#([a-f0-9]{3}){1,2}\b/i', $wikipedia_visual_chap_color_newinput) ) {
            $wikipedia_visual_chap_color_newinput = '#fff';
        }
        return $wikipedia_visual_chap_color_newinput;
    }
    // validate text input
    function wikipedia_visual_chap_text_validate($wvc_options){
        $wikipedia_visual_chap_text_newinput = trim($wvc_options);
        if ( ! preg_match('/^[a-zA-Z0-9,]/', $wikipedia_visual_chap_text_newinput) ) {
            $wikipedia_visual_chap_text_newinput = '';
        }
        return $wikipedia_visual_chap_text_newinput;
    }
    // validate int value
    function wikipedia_visual_chap_int_validate($wvc_options){
        $wikipedia_visual_chap_int_newinput = trim($wvc_options);
        $wvc_int_check_newinput = ( (0 <= $wikipedia_visual_chap_int_newinput) && ($wikipedia_visual_chap_int_newinput <= 150) ) ? $wikipedia_visual_chap_int_newinput : 0;
        return $wvc_int_check_newinput;
    }
    // validate checkbox
    function wikipedia_visual_chap_checkbox_validate($wvc_options){
        $wikipedia_visual_chap_checkbox_newinput = $wvc_options;
        
        if ( $wikipedia_visual_chap_checkbox_newinput['postlink'] == 1 || $wikipedia_visual_chap_checkbox_newinput['postlink'] == 0 ){
            return $wikipedia_visual_chap_checkbox_newinput;
        }
        else {
            return 0;
        }
        return $wikipedia_visual_chap_checkbox_newinput;
    }

    
    // REGISTRATION

    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-icon-color', 'wikipedia_visual_chap_hex_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-color', 'wikipedia_visual_chap_hex_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-background-color', 'wikipedia_visual_chap_hex_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-underline-color', 'wikipedia_visual_chap_hex_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-link-color', 'wikipedia_visual_chap_hex_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-margin-top', 'wikipedia_visual_chap_int_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-words-filter', 'wikipedia_visual_chap_text_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-wiki-donate', 'wikipedia_visual_chap_checkbox_validate' );
    register_setting( 'wvc_options', 'wikipedia-visual-chap-options-dev', 'wikipedia_visual_chap_checkbox_validate' );
    

    // SECTIONS
    
    // output main section html description
    function wikipedia_visual_chap_section_main_description(){
        echo '<p>' . esc_html__('NOTE: if you can\'t see the color inputs, your browser might be out of date: please try again using a modern browser.', 'wikipedia-visual-chap') . '</p>';
    }
    // settings section
    add_settings_section('wikipedia_visual_chap_section_main', esc_html__('Main Settings', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_description', 'wikipedia_visual_chap');

    // INPUTS

    // output main icon color html input
    function wikipedia_visual_chap_section_main_icon_color_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-icon-color');
        echo "<input id='wikipedia-visual-chap-section-main-icon-color' name='wikipedia-visual-chap-options-icon-color' type='color' value='{$wvc_options}' />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-icon-color', esc_html__('Icon color', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_icon_color_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));
                    
    // output main section color html input
    function wikipedia_visual_chap_section_main_color_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-color');
        echo "<input id='wikipedia-visual-chap-section-main-color' name='wikipedia-visual-chap-options-color' type='color' value='{$wvc_options}' />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-color', esc_html__('Font color', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_color_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));

    // output main section background color html input
    function wikipedia_visual_chap_section_main_background_color_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-background-color');
        echo "<input id='wikipedia-visual-chap-section-main-background-color' name='wikipedia-visual-chap-options-background-color' type='color' value='{$wvc_options}' />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-background-color', esc_html__('Background color', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_background_color_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));

    // output main section underline color html input
    function wikipedia_visual_chap_section_main_underline_color_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-underline-color');
        echo "<input id='wikipedia-visual-chap-section-main-underline-color' name='wikipedia-visual-chap-options-underline-color' type='color' value='{$wvc_options}' />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-underline-color', esc_html__('Underline color', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_underline_color_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));
    
    // output main section underline color html input
    function wikipedia_visual_chap_section_main_link_color_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-link-color');
        echo "<input id='wikipedia-visual-chap-section-main-link-color' name='wikipedia-visual-chap-options-link-color' type='color' value='{$wvc_options}' /><p></p>";
    }
    add_settings_field('wikipedia-visual-chap-section-main-link-color', esc_html__('Link color', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_link_color_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));
    
    // output main section margin top html input
    function wikipedia_visual_chap_section_main_margin_top_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-margin-top');
        echo "<input id='wikipedia-visual-chap-section-main-margin-top' name='wikipedia-visual-chap-options-margin-top' type='range' min='0' max='150' step='1' value='{$wvc_options}' /><p>" . esc_html__('useful if your WordPress theme uses a fixed-to-top menu', 'wikipedia-visual-chap') . "<br /><span id='wikipedia-visual-chap-admin-margin-top'>{$wvc_options}</span> px</p>";
    }
    add_settings_field('wikipedia-visual-chap-section-main-margin-top', esc_html__('Top margin', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_margin_top_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));

    // output main section chosen words filter html input
    function wikipedia_visual_chap_section_main_choose_words_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-words-filter');
        echo "<input id='wikipedia-visual-chap-section-main-chosen-words' name='wikipedia-visual-chap-options-words-filter' size='40' type='text' value='{$wvc_options}' /><p style='width: 350px;'>" . __('Leave empty to be active on <strong>ALL</strong> words in recognized paragraphs <strong>OR</strong> type specific words you want Visual Chap to be active on, separated by a comma', 'wikipedia-visual-chap') . "</p>";
    }
    add_settings_field('wikipedia-visual-chap-section-main-chosen-words', esc_html__('Activated words', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_choose_words_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));
    
    // output main section Wikipedia donate input
    function wikipedia_visual_chap_section_main_wiki_donate_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-wiki-donate');
        echo "<input id='wikipedia-visual-chap-section-main-wiki-donate' name='wikipedia-visual-chap-options-wiki-donate' type='checkbox' value='1' " . checked( 1, $wvc_options, false ) . " />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-wiki-donate', esc_html__('Proudly show support for Wikipedia', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_wiki_donate_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));

    // output main section developer link input
    function wikipedia_visual_chap_section_main_dev_input($wvc_options){
        $wvc_options = get_option('wikipedia-visual-chap-options-dev');
        echo "<input id='wikipedia-visual-chap-section-main-dev' name='wikipedia-visual-chap-options-dev' type='checkbox' value='1' " . checked( 1, $wvc_options, false ) . " />";
    }
    add_settings_field('wikipedia-visual-chap-section-main-dev', esc_html__('Proudly show support for _Y_Power, the friendly Visual Chap developer', 'wikipedia-visual-chap'), 'wikipedia_visual_chap_section_main_dev_input', 'wikipedia_visual_chap', 'wikipedia_visual_chap_section_main', array($this, 'wvc_options'));

}

// settings link in plugin management screen
public function wikipedia_visual_chap_settings_link($actions, $file) {
    if (false !== strpos($file, 'visual-chap'))
        $actions['settings'] = '<a href="options-general.php?page=wikipedia-visual-chap-settings">Settings</a>';
    return $actions; 
}

// admin panel
public function admin_panel() {
    if ( is_admin() ){
        // enqueue admin files
        add_action( 'admin_enqueue_scripts', array($this, 'wikipedia_visual_chap_admin_files') );
        // build page html
        add_action( 'admin_menu', array($this, 'wikipedia_visual_chap_settings_page') );
        // add link to settings in plugins list
        add_filter('plugin_action_links', array($this, 'wikipedia_visual_chap_settings_link'), 2, 2);
        // launch settings setup
        add_action('admin_init', array($this, 'wikipedia_visual_chap_settings_setup'));
    }
}

} // class end

}

// launch new wvc obj
$wikipedia_visual_chap = new Wikipedia_Visual_Chap;


//FOR SUPPORT ONLY
//function test_it(){
//    echo '<!-- this line is being inserted by WVC -->';
//}
//add_action('wp_head', 'test_it');


?>

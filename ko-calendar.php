<?php
/*
Plugin Name: Google Calendar Widget
Plugin URI: http://notions.okuda.ca/wordpress-plugins/google-calendar-widget/
Description: This plugin adds a sidebar widget containing an agenda from a Google Calendar.  It is based on the Google Calendar samples and inspired by wpng-calendar.  It is smaller and simpler than wpng-calendar and allows for multiple widgets to each show their own agenda.
Version: 1.2
Author: Kaz Okuda
Author URI: http://notions.okuda.ca
*/

define('KO_CALENDAR_URL', WP_PLUGIN_URL . '/google-calendar-widget');

function ko_calendar_load()
{
	class WP_Widget_KO_Calendar extends WP_Widget
	{
		function WP_Widget_KO_Calendar()
		{
			$widget_ops = array('classname' => 'ko_calendar', 'description' => __('Google Calendar Agenda Widget'));
			$control_ops = array('width' => 400, 'height' => 200);
			$this->WP_Widget('ko_calendar', __('Google Calendar'), $widget_ops, $control_ops);
		}
		
		function widget($args, $instance)
		{
			extract($args);
			$title = empty($instance['title']) ? 'Calendar' : $instance['title'];
			$url = empty($instance['url']) ? 'http://www.google.com/calendar/feeds/developer-calendar@google.com/public/full' : $instance['url'];
			$url2 = empty($instance['url2']) ? '' : $instance['url2'];
			$url3 = empty($instance['url3']) ? '' : $instance['url3'];
			$maxresults = empty($instance['maxresults']) ? '5' : $instance['maxresults'];
			$autoexpand = empty($instance['autoexpand']) ? FALSE : $instance['autoexpand'];

			$title_id = $this->get_field_id('widget_title');
			$event_id = $this->get_field_id('widget_events');
			
			echo $before_widget;
			echo $before_title . '<div class="ko-calendar-widget-title" id="' . $title_id . '">' . $title . '</div>' . $after_title;
			echo '<div class="ko-calendar-widget-events" id="' . $event_id . '">';
			echo '<div class="ko-calendar-widget-loading"><img class="ko-calendar-widget-image" src="' . KO_CALENDAR_URL . '/loading.gif" alt="Loading..."/></div>';
			echo '</div>';
			echo $after_widget;
			?>
			<script type="text/javascript" defer="defer">
				ko_calendar.loadCalendarDefered('<?php echo $title_id ?>', '<?php echo $event_id ?>', <?php echo $maxresults ?>, <?php echo empty($autoexpand) ? 'false' : 'true' ?>, '<?php echo $url ?>', '<?php echo $url2 ?>', '<?php echo $url3 ?>');
			</script>
			<?php
		}
		
		function update($new_instance, $old_instance)
		{
			if (!isset($new_instance['submit'])) {
				return false;
			}
			$instance = $old_instance;
			$instance['title'] = trim(strip_tags($new_instance['title']));
			$instance['url'] = esc_url_raw(strip_tags($new_instance['url']));
			$instance['url2'] = esc_url_raw(strip_tags($new_instance['url2']));
			$instance['url3'] = esc_url_raw(strip_tags($new_instance['url3']));
			$instance['maxresults'] = intval($new_instance['maxresults']);
			$instance['autoexpand'] = empty($new_instance['autoexpand']) ? FALSE : $new_instance['autoexpand'];
			return $instance;
		}
		
		function form($instance)
		{
			$defaults = array( 'title' => '', 'url' => '', 'url2' => '', 'url3' => '', 'maxresults' => 5, 'autoexpand' => FALSE);
			$instance = wp_parse_args( (array) $instance, $defaults );
			$title = esc_attr($instance['title']);
			$url = esc_url($instance['url']);
			$url2 = esc_url($instance['url2']);
			$url3 = esc_url($instance['url3']);
			$maxresults = intval($instance['maxresults']);
			$autoexpand = empty($instance['autoexpand']) ? FALSE : $instance['autoexpand'];

			?>
				<div>
				<label for="<?php echo $this->get_field_id('title'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar Title:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" value="<?php echo $title; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('maxresults'); ?>" style="line-height:35px;display:block;">
					<?php _e('Maximum Results:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('maxresults'); ?>" name="<?php echo $this->get_field_name('maxresults'); ?>" value="<?php echo $maxresults; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('autoexpand'); ?>" style="line-height:35px;display:block;">
					<?php _e('Expand Entries by Default:'); ?>
					<input type="checkbox" id="<?php echo $this->get_field_id('autoexpand'); ?>" name="<?php echo $this->get_field_name('autoexpand'); ?>" <?php echo empty($autoexpand) ? '' : 'checked'; ?>" value="true" />
				</label>
				<label for="<?php echo $this->get_field_id('url'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar URL 1:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('url'); ?>" name="<?php echo $this->get_field_name('url'); ?>" value="<?php echo $url; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('url2'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar URL 2 (Optional):'); ?>
					<input type="text" id="<?php echo $this->get_field_id('url2'); ?>" name="<?php echo $this->get_field_name('url2'); ?>" value="<?php echo $url2; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('url3'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar URL 3 (Optional):'); ?>
					<input type="text" id="<?php echo $this->get_field_id('url3'); ?>" name="<?php echo $this->get_field_name('url3'); ?>" value="<?php echo $url3; ?>" />
				</label>
				<input type="hidden" name="<?php echo $this->get_field_name('submit'); ?>" id="<?php echo $this->get_field_id('submit'); ?>" value="1" />
				</div>
			<?php
		}
	}
	
	function ko_calendar_head()
	{
		echo '<link type="text/css" rel="stylesheet" href="' . KO_CALENDAR_URL . '/ko-calendar.css" />';
	}

	function ko_calendar_init()
	{
		// I believe that the google apikey is no longer needed
		wp_enqueue_script('google', 'http://www.google.com/jsapi', false, 1);
		wp_enqueue_script('date-js', KO_CALENDAR_URL . '/date.js', null, 'alpha-1');
		wp_enqueue_script('wiky-js', KO_CALENDAR_URL . '/wiky.js', null, '1.0');
		//wp_enqueue_script('ko-calendar-test', KO_CALENDAR_URL . '/ko-calendar-test.js', array('date-js', 'google'));
		wp_enqueue_script('ko-calendar', KO_CALENDAR_URL . '/ko-calendar.js', array('date-js', 'google'));
	}

	function ko_calendar_register_widget()
	{
		register_widget('WP_Widget_KO_Calendar');
	}
	
	add_action('wp_head', 'ko_calendar_head');
	add_action('init', 'ko_calendar_init');
	add_action('widgets_init', 'ko_calendar_register_widget');
}

ko_calendar_load();

?>

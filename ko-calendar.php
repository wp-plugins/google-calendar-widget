<?php
/*
Plugin Name: Wordpress Google Calendar Widget
Plugin URI: http://notions.okuda.ca
Description: This plugin adds a sidebar widget containing an agenda from a Google Calendar.  It is based on the Google Calendar samples and inspired by wpng-calendar.  It is smaller and simpler than wpng-calendar and allows for multiple widgets to each show their own agenda.
Version: 0.0.1
Author: Kaz Okuda
Author URI: http://notions.okuda.ca
*/

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
			$url = empty($instance['url']) ? 'http://www.google.com/calendar/feeds/mtseymourskiclub%40gmail.com/public/full' : $instance['url'];
			$maxresults = empty($instance['maxresults']) ? '5' : $instance['maxresults'];

			$title_id = $this->get_field_id('widget_title');
			$event_id = $this->get_field_id('widget_events');
			
			echo $before_widget;
			echo $before_title . '<div class="ko-calendar-widget-title" id="' . $title_id . '">' . $title . '</div>' . $after_title;
			echo '<div class="ko-calendar-widget-events" id="' . $event_id . '">';
			echo '<div class="ko-calendar-widget-loading"><img class="ko-calendar-widget-image" src="' . WP_PLUGIN_URL . '/ko-calendar/loading.gif"/></div>';
			echo '</div>';
			echo $after_widget;
			?>
			<script type="text/javascript" defer="true">
				ko_calendar.loadCalendarDefered('<?php echo $title_id ?>', '<?php echo $event_id ?>', '<?php echo $url ?>', <?php echo $maxresults ?>);
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
			$instance['maxresults'] = intval($new_instance['maxresults']);
			return $instance;
		}
		
		function form($instance)
		{
			$instance = wp_parse_args( (array) $instance, array( 'title' => '', 'url' => '', 'maxresults' => '') );
			$title = esc_attr($instance['title']);
			$url = esc_url($instance['url']);
			$maxresults = intval($instance['maxresults']);

			?>
				<div>
				<label for="<?php echo $this->get_field_id('title'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar Title:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" value="<?php echo $title; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('url'); ?>" style="line-height:35px;display:block;">
					<?php _e('Calendar URL:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('url'); ?>" name="<?php echo $this->get_field_name('url'); ?>" value="<?php echo $url; ?>" />
				</label>
				<label for="<?php echo $this->get_field_id('maxresults'); ?>" style="line-height:35px;display:block;">
					<?php _e('Maximum Results:'); ?>
					<input type="text" id="<?php echo $this->get_field_id('maxresults'); ?>" name="<?php echo $this->get_field_name('maxresults'); ?>" value="<?php echo $maxresults; ?>" />
				</label>
				<input type="hidden" name="<?php echo $this->get_field_name('submit'); ?>" id="<?php echo $this->get_field_id('submit'); ?>" value="1" />
				</div>
			<?php
		}
	}
	
	function ko_calendar_head()
	{
		echo '<link type="text/css" rel="stylesheet" href="' . WP_PLUGIN_URL . '/ko-calendar/ko-calendar.css" />';
	}

	function ko_calendar_init()
	{
		// I believe that the google apikey is no longer needed
		wp_enqueue_script('google', 'http://www.google.com/jsapi', false, 1);
		wp_enqueue_script('date-js', WP_PLUGIN_URL . '/ko-calendar/date.js', null, 'alpha-1');
		wp_enqueue_script('wiky-js', WP_PLUGIN_URL . '/ko-calendar/wiky.js', null, '1.0');
		//wp_enqueue_script('ko-calendar-test', WP_PLUGIN_URL . '/ko-calendar/ko-calendar-test.js', array('date-js', 'google'));
		wp_enqueue_script('ko-calendar', WP_PLUGIN_URL . '/ko-calendar/ko-calendar.js', array('date-js', 'google'));
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

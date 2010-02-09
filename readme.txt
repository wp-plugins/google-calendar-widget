=== Google Calendar Widget ===
Contributors: poco
Donate link: http://notions.okuda.ca
Tags: google, calendar, widget
Requires at least: 2.8
Tested up to: 2.8.5
Stable tag: 1.1

This plugin installs a sidebar widget that can show the upcoming events from a Google Calendar feed.

== Description ==

This plugin installs a widget for showing a Google Calendar agenda on the sidebar.
Once installed it adds a sidebar widget called 'Google Calendar' that may be dragged into your sidebar.
Each widget can be configured with a URL of the calendar feed, a title, and the number of agenda items to show.

The calendar feed is the URL you get when clicking on the XML icon next to 'Calendar Address:' in the Google Calendar settings. [See the full instructions here](http://www.google.com/support/calendar/bin/answer.py?hl=en&answer=37103).

Multiple widgets can be used on the same page and each one can reference a different feed.

See also [http://notions.okuda.ca/wordpress-plugins/google-calendar-widget/](http://notions.okuda.ca/wordpress-plugins/google-calendar-widget/)

== Installation ==

1. Upload all the files to the `/wp-content/plugins/google-calendar-widget` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Drag the 'Google Calendar' widget to your sidebar
1. Fill out the settings for each instance in your sidebar.  You can ge the calendar URL from your Google calendar settings, just be sure to change the "/basic" to "/full".

For example:

* Calendar Title : Google Developer Calendar 
* Calendar URL 1: http://www.google.com/calendar/feeds/developer-calendar@google.com/public/full 
* Calendar URL 2: http://www.google.com/calendar/feeds/insert your feed here/public/full 
* Calendar URL 3: <blank>
* Maximum Results: 6 

== Frequently Asked Questions ==

= Where do I get the calendar feed? =

See the [Google Calendar Support Page](http://www.google.com/support/calendar/bin/answer.py?hl=en&answer=37103).  Just don't forget to change the "/basic" to "/full".

= How do I change the language of the dates =

You can [download localized versions of date.js from here](http://code.google.com/p/datejs/downloads/list).  Find the correct language version in the "build" folder of the zip file, and replace the date.js in the plugin folder.

= How can I change the format of the dates and times =

The date and time is formatted using the date.js library.
Look for code like the following two lines in ko-calendar.js and change the format argument to match the format you want.

	startJSDate.toString("ddd, MMM d, yyyy h:mm tt")
	dateString = startJSDate.toString('MMM dd');

The formatting represents how the information will look on the page "MMM" translates to the abbreviated name of the month.
 
Take a look at the documentation for how you can change that formatting string to match what you want.
http://code.google.com/p/datejs/wiki/FormatSpecifiers
 
For example, you can change the following

	dateString = startJSDate.toString('MMM dd');

to this

    dateString = startJSDate.toString('dd.MM.yyyy');

to change the agenda item "Jan 2" to "02.01.2009"

= Why is HTML in my calendar entry getting mangled =

The plugin uses the [wiky.js library](http://goessner.net/articles/wiky/) that generates HTML from a wiki-like markup language.
It expects that the calendar item descriptions are marked up using that format.  This is done to simplify the formatting for users who are already familiar with wiki markup and make the calendar entries easier to read when not interpreted.

If you wish to remove this transformation simply replace the following line in ko-calendar.js

	bodyDiv.innerHTML = Wiky.toHtml(entryDesc);

With

	bodyDiv.innerHTML = entryDesc;

== Screenshots ==

1. The widget showing the upcoming Google developer calendar events on the sidebar of the default Wordpress theme.

== Changelog ==

= 1.0 =
* Initial release

= 1.1 =
* Added ability to support multiple feeds (up to 3) from one widget.

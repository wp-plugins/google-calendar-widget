
var ko_calendar = function ()
{
	var result = {};

	function log(message)
	{
		// Firebug debugging console
		//console.log(message);
	}
	
	function buildDate(entry)
	{
		/* display the date/time */
		var dateString = 'All Day Event';
		var times = entry.getTimes();
		if (times.length)
		{
			/* if the event has a date & time, override the default text */
			var startTime = times[0].getStartTime();
			var endTime = times[0].getEndTime();

			var startJSDate = startTime.getDate();
			var endJSDate = new Date(endTime.getDate());

			// If the start and end are dates (full day event)
			// then the end day is after the last day of the event (midnight that morning)
			var allDayEvent = false;
			if (startTime.isDateOnly() && endTime.isDateOnly())
			{
				endJSDate.setDate(endJSDate.getDate() - 1);

				if (endJSDate.getTime() == startJSDate.getTime()) 
				{
					// This is a one day event.
					allDayEvent = true;
				}
			}
			
			var oneDayEvent = false;
			{
				var startDay = new Date(startJSDate.getFullYear(), startJSDate.getMonth(), startJSDate.getDate());
				var endDay = new Date(endJSDate.getFullYear(), endJSDate.getMonth(), endJSDate.getDate());
				if (startDay.getTime() == endDay.getTime())
				{
					oneDayEvent = true;
				}
			}

			if (allDayEvent)
			{
				dateString = 'All Day Event';
			}
			else if (oneDayEvent)
			{
				dateString = startJSDate.toString("ddd, MMM d, yyyy");
				dateString += ', ';
				dateString += startJSDate.toString("h:mm tt");
				dateString += ' - ';
				dateString += endJSDate.toString("h:mm tt");
			}
			else
			{
				if (!startTime.isDateOnly())
				{
					dateString = startJSDate.toString("ddd, MMM d, yyyy h:mm tt");
				}
				else
				{
					dateString = startJSDate.toString("ddd, MMM d, yyyy");
				}
				dateString += ' - ';
				if (!endTime.isDateOnly())
				{
					dateString += endJSDate.toString("ddd, MMM d, yyyy h:mm tt");
				}
				else
				{
					dateString += endJSDate.toString("ddd, MMM d, yyyy");
				}
			}
		}
		var dateRow = document.createElement('div');
		dateRow.setAttribute('className','ko-calendar-entry-date-row');
		dateRow.setAttribute('class','ko-calendar-entry-date-row');

		/*dateLabel = document.createElement('div');
		dateLabel.appendChild(document.createTextNode('When: '));
		dateLabel.setAttribute('className','ko-calendar-entry-date-label');
		dateLabel.setAttribute('class','ko-calendar-entry-date-label');
		dateRow.appendChild(dateLabel);
		*/

		dateDisplay = document.createElement('div');
		//dateDisplay.appendChild(document.createTextNode(dateString));
		dateDisplay.innerHTML = dateString;
		dateDisplay.setAttribute('className','ko-calendar-entry-date-text');
		dateDisplay.setAttribute('class','ko-calendar-entry-date-text');
		dateRow.appendChild(dateDisplay);

		return dateRow;
	}

	function buildLocation(entry)
	{
		var locationDiv = document.createElement('div');
		var locationString = entry.getLocations()[0].getValueString();
		if (locationString != null)
		{
			locationDiv.appendChild(document.createTextNode(locationString));
			locationDiv.setAttribute('className','ko-calendar-entry-location-text');
			locationDiv.setAttribute('class','ko-calendar-entry-location-text');
		}
		
		return locationDiv;
	}

	/**
	 * Show or hide the calendar entry (as a <div> child of item) when the item is clicked.
	 * Initially this will show a div containing the content text.
	 * This could collect other information such as start/stop time
	 * and location and include it in the node.
	 *
	 * @param {div} HTML element into which we will add and remove the calendar entry details.
	 * @param {calendar entry} Google Calendar entry from which we will get the details.
	 */
	function createClickHandler(item, entry)
	{
		var entryDesc = entry.getContent().getText();
		if (entryDesc == null)
		{
			return function() {}
		}

		var descDiv = null;
		return function () 
		{
			if (descDiv == null)
			{
				descDiv = document.createElement('div');
				
				descDiv.appendChild(buildDate(entry));
				descDiv.appendChild(buildLocation(entry));
				
				bodyDiv = document.createElement('div');
				bodyDiv.setAttribute('className','ko-calendar-entry-body');
				bodyDiv.setAttribute('class','ko-calendar-entry-body');
				bodyDiv.innerHTML = Wiky.toHtml(entryDesc);
				descDiv.appendChild(bodyDiv);

				item.appendChild(descDiv);
			}
			else
			{
				// Hide all the children of this node (which should be text we added above)
				item.removeChild(descDiv);
				descDiv = null;
			}
		}
	}

	/**
	 * Callback function for the Google data JS client library to call with a feed 
	 * of events retrieved.
	 *
	 * Creates an unordered list of events in a human-readable form.  This list of
	 * events is added into a div with the id of 'outputId'.  The title for the calendar is
	 * placed in a div with the id of 'titleId'.
	 *
	 * @param {json} feedRoot is the root of the feed, containing all entries 
	 */
	function createListEvents(titleId, outputId, maxResults, googleService, urls)
	{
		function mergeFeeds(resultArray)
		{
			// This function merges the input arrays of feeds into one single feed array.
			// It is assumed that each feed is sorted by date.  We find the earliest item in
			// the lists by comparing the items at the start of each array.

			// Store all of the feed arrays in an an array so we can "shift" items off the list.
			var entries = new Array();
			for (var i=0; i < resultArray.length; i++)
			{
				if (resultArray[i])
				{
					log("Feed " + i + " has " + resultArray[i].feed.getEntries().length + " entries");
					entries.push(resultArray[i].feed.getEntries());
				}
			}
			
			log("Merging " + entries.length + " feeds");
			
			// Now look at the first element in each feed to figure out which one is first.
			// Insert them in the output in chronological order.
			var output = new Array();

			while(true)
			{
				var firstStartTime = null;
				var firstStartIndex = null;
				for (var i=0; i < entries.length; i++)
				{
					var data = entries[i][0];
					if (data != null)
					{
						var times = data.getTimes();
						if (times.length > 0)
						{
							var startDateTime = times[0].getStartTime().getDate();
							if (firstStartTime == null || startDateTime < firstStartTime)
							{
								log( startDateTime + " from feed " + i + " is before " + firstStartTime + " from feed " + firstStartIndex);
								firstStartTime = startDateTime;
								firstStartIndex = i;
							}
						}
					}
				}
				if (firstStartTime != null)
				{
					// Add the entry to the output and shift it off the input.
					output.push(entries[firstStartIndex].shift());
				}
				else
				{
					// No new items were found, so we must have run out.
					break;
				}
			}
			
			return output;
		}

		function processFinalFeed(feedRoot) {
			// var entries = feedRoot.feed.getEntries();
			var entries = feedRoot;
			var eventDiv = document.getElementById(outputId);
			if (eventDiv.childNodes.length > 0) {
				eventDiv.removeChild(eventDiv.childNodes[0]);
			}	  

			/* set the ko-calendar-title div with the name of the calendar */
			//document.getElementById(titleId).innerHTML = feedRoot.feed.title.$t;

			/* loop through each event in the feed */
			var prevDateString = null;
			var eventList = null;
			var len = entries.length;
			for (var i = 0; i < len; i++) {
				var entry = entries[i];
				var title = entry.getTitle().getText();
				var startDateTime = null;
				var startJSDate = null;
				var times = entry.getTimes();
				if (times.length > 0) {
					startDateTime = times[0].getStartTime();
					startJSDate = startDateTime.getDate();
				}
				var entryLinkHref = null;
				if (entry.getHtmlLink() != null) {
					entryLinkHref = entry.getHtmlLink().getHref();
				}
				dateString = startJSDate.toString('MMM dd');

				if (dateString != prevDateString) {

					// Append the previous list of events to the widget
					if (eventList != null) {
						eventDiv.appendChild(eventList);
					}

					// Create a date div element
					var dateDiv = document.createElement('div');
					dateDiv.setAttribute('className','ko-calendar-date');
					dateDiv.setAttribute('class','ko-calendar-date');
					dateDiv.appendChild(document.createTextNode(dateString));

					// Add the date to the calendar
					eventDiv.appendChild(dateDiv);

					// Create an div to add each agenda item
					eventList = document.createElement('div');
					eventList.setAttribute('className','ko-calendar-event-list');
					eventList.setAttribute('class','ko-calendar-event-list');
					
					prevDateString = dateString;
				}

				var li = document.createElement('div');
				
				/* if we have a link to the event, create an 'a' element */
				/*
				if (entryLinkHref != null) {
					entryLink = document.createElement('a');
					entryLink.setAttribute('href', entryLinkHref);
					entryLink.appendChild(document.createTextNode(title));
					li.appendChild(entryLink);
					//li.appendChild(document.createTextNode(' - ' + dateString));
				}
				else
				*/
				{

					// Add the title as the first thing in the list item
					// Make it an anchor so that we can set an onclick handler and
					// make it look like a clickable link
					var entryTitle = document.createElement('a');
					entryTitle.setAttribute('className','ko-calendar-entry-title');
					entryTitle.setAttribute('class','ko-calendar-entry-title');
					entryTitle.setAttribute('href', "javascript:;");
					entryTitle.appendChild(document.createTextNode(title));

					// Show and hide the entry text when the entryTitleDiv is clicked.
					entryTitle.onclick = createClickHandler(li, entry);

					li.appendChild(entryTitle);

				}

				eventList.appendChild(li);
			}
			
			if (eventList != null) {
				eventDiv.appendChild(eventList);
			}
		}
		
		// Keep a list of all of the queries to be sorted later.
		var sQueries = new Array();
		
		// Store the list of urls which we will be iterating through.
		var sUrls = urls;

		function callback(feedRoot)
		{
			// If the feed is not invalid then push it into a list.
			if (feedRoot)
			{
				sQueries.push(feedRoot);
			}
			
			var url = '';
			
			// Skip blank urls.
			do 
			{
				url = sUrls.pop();

			} while (url == '');
			
			if (url != undefined)
			{
				var query = new google.gdata.calendar.CalendarEventQuery(url);
				query.setOrderBy('starttime');
				query.setSortOrder('ascending');
				query.setFutureEvents(true);
				query.setSingleEvents(true);
				query.setMaxResults(maxResults);
				googleService.getEventsFeed(query, callback, handleGDError);
			}
			else
			{
				// We are done.
				// Merge the events in sQueries and apply them.				
				// For now we just insert them individually.
				// for (var i=0; i < sQueries.length; i++)
				// {
					// if (sQueries[i])
					// {
						// processFinalFeed(sQueries[i]);
					// }
				// }
				
				var finalFeed = mergeFeeds(sQueries);
				processFinalFeed(finalFeed);
			}
		}
		
		return callback;
		
	}

	/**
	 * Callback function for the Google data JS client library to call when an error
	 * occurs during the retrieval of the feed.  Details available depend partly
	 * on the web browser, but this shows a few basic examples. In the case of
	 * a privileged environment using ClientLogin authentication, there may also
	 * be an e.type attribute in some cases.
	 *
	 * @param {Error} e is an instance of an Error 
	 */
	function handleGDError(e) {
		
		// For production code, just ignore the error
		// Remove the return below for testing.
		return;
	
		//document.getElementById('jsSourceFinal').setAttribute('style', 'display:none');
		if (e instanceof Error) {
			/* alert with the error line number, file and message */
			alert('Error at line ' + e.lineNumber + ' in ' + e.fileName + '\n' + 'Message: ' + e.message);
			/* if available, output HTTP error code and status text */
			if (e.cause) {
				var status = e.cause.status;
				var statusText = e.cause.statusText;
				alert('Root cause: HTTP error ' + status + ' with status text of: ' + statusText);
			}
		} else {
			alert(e.toString());
		}
	}

	/**
	 * Uses Google data JS client library to retrieve a calendar feed from the specified
	 * URL.  The feed is controlled by several query parameters and a callback 
	 * function is called to process the feed results.
	 *
	 * @param {string} titleId is the id of the element in which the title could be written.
	 * @param {string} outputId is the id of the element in which the output is to be written.
	 * @param {string} calendarUrl is the URL for a public calendar feed
	 * @param {string} calendarUrl2 is the URL for a second public calendar feed
	 * @param {number} maxResults is the maximum number of results to be written to the output element.
	 */  
	function loadCalendar(titleId, outputId, maxResults, calendars)
	{
		// Uncomment the following two lines for offline testing.
		//ko_calendar_test.testCalendar();
		//return;

		var service = new google.gdata.calendar.CalendarService('google-calendar-widget');
		var requestFunc = createListEvents(titleId, outputId, maxResults, service, calendars);
		
		// Calling the created callback with no parameters will start the process of downloading
		// the set of calendars pushed in with calendar.
		requestFunc();
		
		// var query = new google.gdata.calendar.CalendarEventQuery(calendarUrl);
		// query.setOrderBy('starttime');
		// query.setSortOrder('ascending');
		// query.setFutureEvents(true);
		// query.setSingleEvents(true);
		// query.setMaxResults(maxResults);
		// service.getEventsFeed(query, createListEvents(titleId, outputId, service, new Array()), handleGDError);
	}

	result.loadCalendarDefered = function(titleId, outputId, maxResults, calendarUrl, calendarUrl2, calendarUrl3)
	{
		var calendars = new Array();
		calendars.push(calendarUrl);
		calendars.push(calendarUrl2);
		calendars.push(calendarUrl3);

		google.setOnLoadCallback(function() { loadCalendar(titleId, outputId, maxResults, calendars); });
	}
	
	result.init = function()
	{
		// init the Google data JS client library with an error handler
		google.gdata.client.init(handleGDError);
	}
	
	return result;

} ();

google.load("gdata", "2.x");
google.setOnLoadCallback(ko_calendar.init);

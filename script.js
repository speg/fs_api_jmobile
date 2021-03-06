APP = {
	survey: null,
	surveys:{},
	responses:[],
	contactlists:[]
};

// Listen for any attempts to call changePage().
$(document).bind( "pagebeforechange", function( e, data ) {

	// We only want to handle changePage() calls where the caller is
	// asking us to load a page by URL.
	if ( typeof data.toPage === "string" ) {

		// We are being asked to load a page by URL, but we only
		// want to handle URLs that request the data for a specific
		// survey.
		var u = $.mobile.path.parseUrl( data.toPage ),
			re = /^#surveylist/;

		if ( u.hash.search(re) !== -1 ) {

			// We're being asked to display the items for a specific survey.
			// Call our internal method that builds the content for the survey
			// on the fly based on our in-memory survey data structure.
			showSurvey( u, data.options );

			// Make sure to tell changePage() we've handled this call so it doesn't
			// have to do anything.
			e.preventDefault();
		}
		
		if (u.hash.search(/^#responses/) !== -1 ) {
			console.log('show responses');
			showResponses(u, data.options);
			e.preventDefault();
		}
		
		if (u.hash.search(/^#invite_/) !== -1 ) {
			console.log('SHOW INVITE');
			showInvite(u, data.options);		
			e.preventDefault();
		}

		if (u.hash.search(/^#send/) !== -1 ) {
			console.log('SEND MAIL');
			
			//find checked contact lists
			
			var checked = $(':checked','#contactListSelectors');
			
			APP.selected_list_ids = [];
			checked.each(function(i,el){
				//add each list ID to the array of selected lists
				APP.selected_list_ids.push(+el.id.substring(9));
			});

			//create the email:
			createEmail();

			//sendEmail(u, data.options);		
			e.preventDefault();
		}	
		
	
	}
});

				
$(document).ready(function(){
	//fire the missles!
	callAPI('GET','/surveys/',false,loadSurveys);
	callAPI('GET','/contact-lists/',false,loadContactLists);

				
}); //end of document ready.





SURVEYS = {};
RESPONSES = [];

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
			//sendEmail(u, data.options);		
			//e.preventDefault();
		}	
		
	
	}
});

				
$(document).ready(function(){
	//fire the missles!
	base = 'https://app.fluidsurveys.com/api/v2';
	
	
	callAPI('GET',base+'/surveys/',false,function(data){
		 //console.log(data);
		var s = '';
		 $.each(data.surveys.reverse(),function(){
		 	s = s + '<li><a href="#surveylist?survey='+this.id+'">'+this.name+'</a></li>';
		 	//var survey = this;
		 	SURVEYS['s'+this.id] = {title: this.name,
		 							creator: this.creator,
		 							created_at: this.created_at,
		 							responses: this.responses,
		 							deploy: this.deploy_uri,
		 							id: this.id
		 							};
		// 	console.log(this.id);
		// 	//callAPI('GET','surveys/'+this.id+'/responses',function(responses){
		 		//console.log(responses);
		 		//var survey_page = $('<div id="s'+survey.id+'" data-role="page"></div>');
		 		//$(survey_page).append('<div data-role="Header"><h1>'+survey.name+'</h1></div>');
		 		//$(survey_page).append('<div data-role="Content"><p>blah blah blah</p></div>');
		 		//$(survey_page).page();
		 		//$(survey_page).appendTo('body');
			//});
		});
		
		$('#survey-list').append(s);
		$('#survey-list').listview('refresh');

		//console.log('GET surveys',JSON.parse(data));

	});

				
}); //end of document ready.





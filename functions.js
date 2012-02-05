function BlockMove(event) {
	// Tell Safari not to move the window.
	//event.preventDefault() ;
}

function stringify(obj){
	//turns all properties into strings and returns as stringified JSON;
	var dupe = {};
	for (var name in obj){
		dupe[name] = (''+obj[name]).replace(['>','<'],['&gt;','&lt;']);		
	}
	console.log()
	return JSON.stringify(dupe);
}

function callAPI(type,url,data,callback){
	var link, header;
	if (url.indexOf('http') === 0){
		//passed in a proper uri, do nothing;
		link = 'http://www.speg.com/chideit/proxy/proxy.php?method='+url;
		//link = url;
	}else{
		if (url.indexOf('?') === -1 && url.charAt(url.length-1) !== '/'){
			url = url + '/';	//I ALWAYS FORGOT TO ADD THIS STUPID SLASH
		}
		if (url.charAt(0) === '/'){
			link = 'http://www.speg.com/chideit/proxy/proxy.php?method=https://app.fluidsurveys.com/api/v2'+url;
			//link = 'http://localhost:8000/api/v2'+url;
		}else{
			link = 'http://www.speg.com/chideit/proxy/proxy.php?method=https://app.fluidsurveys.com/api/v2/'+url;
		}


	}

	console.log('Calling',link);

	if (type.toUpperCase() === 'POST'){
		if (typeof(data) === 'object'){
			header = 'application/json';
			data = stringify(data);
		}else if(typeof(data) === 'string'){
			//header = 'application/x-www-form-urlencoded';
			header = 'application/json';			
			//need to hack this up for jQuery:

			// var arr = data.split('&');
			// var obj = {};
			// for(var i = 0; i < arr.length; i++) {
   //  			var bits = arr[i].split('=');
   //  			obj[bits[0]] = bits[1];
			// }
			// data = $.param(obj);

		}
		console.log('POSTING ', data);
	}


	var j = $.ajax({
			beforeSend: function(xhr){
				if (type.toUpperCase() === 'POST'){
					xhr.setRequestHeader('Content-Type', header);
				}
			},
			url: link,
			type: type,
			processData:false,
			data: data,
			success: function(data){
				//console.log('callAPI',data);
				try{
					console.log('successfully called API', data, typeof(data));
					if (typeof(data) === 'object'){
						console.log('how are you already an object?');
						callback(data);
					}else{
						callback(JSON.parse(data));
					}
				}catch(err){
					console.log('There was an API error:',err,data);
				}
			},
			error: function(a,b,c){
				console.log(a,b,c);
			}
		});		
}

// Load the data for a specific survey, based on
// the URL passed in. Generate markup for the items in the
// survey, inject it into an embedded page, and then make
// that page the current active page.
function showSurvey( urlObj, options )
{
	var surveyID = urlObj.hash.replace( /.*survey=/, "" ),

		// Get the object that represents the survey we
		// are interested in. Note, that at this point we could
		// instead fire off an ajax request to fetch the data, but
		// for the purposes of this sample, it's already in memory.
		// survey = surveyData[ surveyID ],
		survey = APP.surveys[ 's'+surveyID ];
		// The pages we use to display our content are already in
		// the DOM. The id of the page we are going to write our
		// content into is specified in the hash before the '?'.
		pageSelector = urlObj.hash.replace( /\?.*$/, "" );

	if ( survey ) {
		// Get the page we are going to dump our content into.
		var $page = $( pageSelector ),

			// Get the header for the page.
			$header = $page.children( ":jqmData(role=header)" ),

			// Get the content area element for the page.
			$content = $page.children( ":jqmData(role=content)" ),
			
			// The markup we are going to inject into the content
			// area of the page.
			//markup = "<p>" + survey.description + "</p><ul data-role='listview' data-inset='true'>",
			markup = "<h3>Created by "+survey.creator+" on "+survey.created_at+".</h3><a href=\"#responses\" data-role=\"button\">View "+survey.responses+" Responses</a></td></tr><tr><a href=\"#invite\" data-role=\"button\">Invite</a></tr></tbody></table><a href=\""+survey.deploy+"\" data-role=\"button\" data-icon=\"arrow-r\" data-iconpos=\"bottom\">Take the Survey</a>";
						
			// The array of items for this survey.
			//cItems = survey.items,

			// The number of items in the survey.
			//numItems = cItems.length;

			// update APP object with selected survey:
			APP.survey = survey;

		//as we're loadign the survey we'll pre-load it's responses
		
		callAPI('GET','/surveys/'+survey.id+'/responses/',false, function(data){
			//add each of the responses to the responses list.
			APP.responses = [];
			//console.log(APP.responses,data);
			$.each(data.responses,function(i,response){
				re = [];
				$.each(response,function(key,value){
					if(key.lastIndexOf('_', 0) === 0){
						//this is a property of the response, ignore for now.
					}else{
						//console.log(key,value);
						re.push({id:key,
								'value':value
								});
					}
						
				});
				APP.responses.push(re);
			});
		//.log(APP.responses);
		});//end callAPI
		
		
		// Generate a list item for each item in the survey
		// and add it to our markup.
		// for ( var i = 0; i < numItems; i++ ) {
		// 	markup += "<li>" + cItems[i].name + "</li>";
		// }
		// markup += "</ul>";

		// Find the h1 element in our header and inject the name of
		// the survey into it.
		$header.find( "h1" ).html( survey.title );

		// Inject the survey items markup into the content element.
		$content.html( markup );

		// Pages are lazily enhanced. We call page() on the page
		// element to make sure it is always enhanced before we
		// attempt to enhance the listview markup we just injected.
		// Subsequent calls to page() are ignored since a page/widget
		// can only be enhanced once.
		$page.page();

		//Enhance the button
		$content.find(":jqmData(role=button)").button();

		// Enhance the listview we just injected.
		//$content.find( ":jqmData(role=listview)" ).listview();

		// We don't want the data-url of the page we just modified
		// to be the url that shows up in the browser's location field,
		// so set the dataUrl option to the URL for the survey
		// we just loaded.
		options.dataUrl = urlObj.href;

		// Now call changePage() and tell it to switch to
		// the page we just modified.
		$.mobile.changePage( $page, options );
	}
}

// Load the data for a specific survey, based on
// the URL passed in. Generate markup for the items in the
// survey, inject it into an embedded page, and then make
// that page the current active page.
function showResponses( urlObj, options )
{
	//var surveyID = urlObj.hash.replace( /.*survey=/, "" ),

		// Get the object that represents the survey we
		// are interested in. Note, that at this point we could
		// instead fire off an ajax request to fetch the data, but
		// for the purposes of this sample, it's already in memory.
		// survey = surveyData[ surveyID ],
	//	survey = APP.surveys[ 's'+surveyID ];
		// The pages we use to display our content are already in
		// the DOM. The id of the page we are going to write our
		// content into is specified in the hash before the '?'.
		//var pageSelector = urlObj.hash.replace( /\?.*$/, "" );

	if ( APP.responses ) {
		// Get the page we are going to dump our content into.
		var $page = $( '#responses' ),

			// Get the header for the page.
			$header = $page.children( ":jqmData(role=header)" ),

			// Get the content area element for the page.
			$content = $page.children( ":jqmData(role=content)" ),

			markup = "",
		
			numItems = APP.responses.length;

		
		// Generate a list item for each item in the survey
		// and add it to our markup.
		for ( var i = 0; i < numItems; i++ ) {
		 	//build APP.responses
		 	markup += "<ul data-role='listview' data-inset='true'>";
		 	var questions = APP.responses[i].length;
		 	for (var j = 0; j < questions; j++){
		 		markup += "<li>" + APP.responses[i][j].id + " : "+APP.responses[i][j].value+"</li>";
		 	}
		 	markup += "</ul>"
		 }
		// markup += "</ul>";

		// Find the h1 element in our header and inject the name of
		// the survey into it.
		$header.find( "h1" ).html( 'Responses' );

		// Inject the survey items markup into the content element.
		$content.html( markup );

		// Pages are lazily enhanced. We call page() on the page
		// element to make sure it is always enhanced before we
		// attempt to enhance the listview markup we just injected.
		// Subsequent calls to page() are ignored since a page/widget
		// can only be enhanced once.
		$page.page();

		//Enhance the button
		//$content.find(":jqmData(role=button)").button();

		// Enhance the listview we just injected.
		$content.find( ":jqmData(role=listview)" ).listview();

		// We don't want the data-url of the page we just modified
		// to be the url that shows up in the browser's location field,
		// so set the dataUrl option to the URL for the survey
		// we just loaded.
		options.dataUrl = urlObj.href;

		// Now call changePage() and tell it to switch to
		// the page we just modified.
		$.mobile.changePage( $page, options );
	}
}


function showInvite( urlObj, options )
{
	var surveyID = urlObj.hash.replace( /.*invite_/, "" ),
		survey = APP.surveys[ 's'+surveyID ];

	if ( survey ) {
		// Get the page we are going to dump our content into.
		var $page = $( '#invite' ),

			// Get the header for the page.
			$header = $page.children( ":jqmData(role=header)" ),

			// Get the content area element for the page.
			$content = $page.children( ":jqmData(role=content)" ),
			
			// The markup we are going to inject into the content
			// area of the page.
			markup = "";
			
		markup = '<label for="basic">Subject:</label><input type="text" name="subject" id="subject" value="Subject"  />';
		markup += '<label for="textarea-a">Message:</label><textarea name="textarea" id="textarea-a">Please fill out our survey!\n\n[Invite Link]</textarea>';
		markup += '<a href=\"#send"\" data-role=\"button\">Send</a>';
		// Inject the survey items markup into the content element.
		$content.html( markup );
		$content.page();
		$page.page();		
		//$content.find( ":jqmData(role=listview)" ).listview();	
		options.dataUrl = urlObj.href;
		$.mobile.changePage( $page, options );
	}
}

function sendEmail( urlObj, options )
{
	//console.log('sending email..');
	//console.log($('#subject').val());
	
	var surveyID = urlObj.hash.replace( /.*invite_/, "" ),
		survey = APP.surveys[ 's'+surveyID ];

	if ( survey ) {
		// Get the page we are going to dump our content into.
		var $page = $( '#invite' ),

			// Get the header for the page.
			$header = $page.children( ":jqmData(role=header)" ),

			// Get the content area element for the page.
			$content = $page.children( ":jqmData(role=content)" );
			
			// The markup we are going to inject into the content
			// area of the page.
			
		// Inject the survey items markup into the content element.

		$content.append(markup).create();
		$page.page();		
		$content.find( ":jqmData(role=listview)" ).listview();
		


		options.dataUrl = urlObj.href;
		$.mobile.changePage( $page, options );
	}
}

function loadSurveys(data){
	//Recieves a list of surveys in data and writes them out in a list.
	var s = '';
	$.each(data.surveys.reverse(),function(){
		s = s + '<li><a href="#surveylist?survey='+this.id+'">'+this.name+'</a></li>';
		//var survey = this;
		APP.surveys['s'+this.id] = {title: this.name,
								creator: this.creator,
								created_at: this.created_at,
								responses: this.responses,
								deploy: this.deploy_uri,
								id: this.id
								};
	});
	
	$('#survey-list').append(s);
	$('#survey-list').listview('refresh');
}

function loadContactLists(data){
	//Recieves a list of contact lists and stores them to the app object.
	var markup = '<legend>Select one or more Contact Lists to send to:</legend>';
	for(var i=0; i<data.total; i++){
		//add each list to the CONTACTLASTS
		APP.contactlists.push({
			contacts: data.lists[i].contacts,
			contacts_uri: data.lists[i].contacts_uri,
			id: data.lists[i].id,
			name: data.lists[i].name,
			uri: data.lists[i].uri
		});
		
		//and build it's HTML
		markup += '<input type="checkbox" name="checkbox-'+i+'" id="checkbox-'+i+'" class="custom" />';
		markup += '<label for="checkbox-'+i+'">'+data.lists[i].name+'</label>';
	}
	$('#contactListSelectors').html(markup);
}

function createEmail(){
	//creates an email.
	//adds contacts to email.
	//sends the email.
	console.log('sending email');
	callAPI('POST','/emails/?survey='+APP.survey.id,{message:"Hello Friends! [Invite Link]", sender:"Steve <steve@speg.com>", subject: "Hello World"},readyEmail);
}

function readyEmail(data){
	console.log('ready the email!',data);

	//add contact lists if any
	if (APP.selected_list_ids.length > 0){
		callAPI('POST', data.recipients_uri, 'contact_list='+APP.contactlists[APP.selected_list_ids[0]].id, function(){
			sendEmail(data.send_uri);
		});
	}
	//add recipients if any

	//if either of the above, send it!

	//else saved as draft

}

function sendEmail(uri){
	//press the red button.
	callAPI('POST',uri,false,function(data){
		console.log('The email has been sent.',data)
	});

}




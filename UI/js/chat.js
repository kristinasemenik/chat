'use strict';

var uniqueId = function() {
	var date = Date.now();
	var random = Math.random() * Math.random();

	return Math.floor(date * random).toString();
};

var theMessage = function(text) {
	return {		
		text:text,
		user: appState.user,
		id: uniqueId()
	};
};

var appState = {
	user: 'User_' + uniqueId(),
	mainUrl : 'http://localhost:999/chat',
	history:[],
	token : 'TE11EN'
};

function run() {
	var sendButton = document.getElementById('sendButton');
	var newMessageBox = document.getElementById('newMessage');

	newMessageBox.addEventListener('keypress', function(e) {
		if(e.keyCode == 13)
			onSendButtonClick();
		return false;
	});
	sendButton.addEventListener('click', onSendButtonClick);	
	doPolling();
	updateCounter();
}
function updateHistory(newMessages) {
	for(var i = 0; i < newMessages.length; i++)
		addMessageInternal(newMessages[i]);
}
	
function search(){
		var query=document.getElementById('search_field').value;
		$('.history .media').hide();
		$('.media:contains('+query+')').show();
			query = '';	
		updateCounter();			
		}
		
//hiding toggled element 		
window.onload = function()
		{	
	//show who you are	
	var user=appState.user;
	var text_user=document.getElementById('user');
	text_user.innerHTML='Welcome, '+user;	
	
	//menu-buttons clicks
	$(document.body).on('click','.btn-group-sm', function(event){
	
	console.log(event.target);
	
	if($(event.target).hasClass("btn-hideone")){//hide one message 
												//alert("hi from if");
												 //console.log("fom if 1 "+event.target);
												 $(event.target).parent().parent().parent().parent().hide();
													}
	else if($(event.target).hasClass("btn-quote")){ 
									//add a comment to bomebody's message
									//alert("hi from quuote");
									//console.log("from if 2 "+event.target);											
									var text_to_quote = $(event.target).parent().parent().children(".msg").html();	
									var inputvalue= $("#newMessage").val();
									$("#newMessage").val( inputvalue+'<br>'+'<i>'+text_to_quote+'</i>'+'<br>' + '<hr>');												
									}
	else if($(event.target).hasClass("btn-hideallusers")){ 
									//alert("hi fromall users");
									//console.log("from if 3 "+event.target);
									var user=$(event.target).parent().parent().children(".text-muted").html();
									
									$(".text-muted:contains("+user+")").parent().hide();									
										user = '';	
									updateCounter();			
									}
									
									
				else {alert("nothing");}
  }); 
  //show all user messages by username click
	$(document.body).on('click','.history .text-muted', function(event){	 
		console.log(event.target); 
		var user = event.target;
		alert('happened '+event.target);	
		var cont=$(event.target).parent().children('.text-muted').html();
			alert(cont);
		$('.media').hide();
		$('.media:contains('+cont+')').show();
		});	
	}
	

	
/*	
function uzery(){
	//show all users list
	//var users=$()
	//var divs = $('.history .text-muted');//document.getElementsByClassName( '.text-muted' );
	var divs=appState.history;
	var users=[];

		var c=divs.length;
		alert('length ='+c);
		
		var k=1;//schetchik userov
		users[0]===divs[0].user;
		for (var j = 1; j<c; j++){
		
			var has_been=0;	//bool - was/wasn't	count user
			for( var i = 0; i < k; i++ ) {
				
				if (users[i]===divs[j].user) {
					has_been=1;
					}
				}
					
			if (has_been==0){//esli ne bylo usera s takim imenem
					k=k+1;
					users[k]===divs[j].user;
				}	
				//alert('j= '+j);
		}	
		//alert('k= '+k);
		//var k=$('.history .text-muted').length;
		//var userrr=appState.history;
		for (var i=0; i<k;i++){			
			alert(users[i]);				
				}
				//break;
	}
*/	
function onSendButtonClick(){
	var newMessageBox = document.getElementById('newMessage');
	var newMessage = theMessage(newMessageBox.value);

	if(newMessageBox.value == '')
		return;

	newMessageBox.value = '';
	sendMessage(newMessage, function() {
		updateCounter();
		console.log('Message sent ' + newMessage.text);		
	});
} 

function sendMessage(message, continueWith) {
	post(appState.mainUrl, JSON.stringify(message), function(){
		continueWith && continueWith();
	});
}



function addMessageInternal(message) {
	var msg=createMessage(message);
	var historyBox = document.getElementsByClassName('history')[0];
	var history = appState.history;

	history.push(message);
	historyBox.appendChild(msg);
	
}
function createMessage(message){
	var temp = document.createElement('div');
	
	var htmlAsText = '<li class="media" >'
	
		+'<div class="media-body" >'
			+'<div class="media">'
			+'<div class="btn-group-sm pull-right">'
				+'<button class="btn-hideone" title="Спрятать это \n сообщение">1</button>'
				+'<button class="btn-quote" title="Цитировать">2</button>'
				+'<button class="btn-hideallusers" title="Спрятать все сообщения \n этого пользователя">3</button>'
			+'</div>'
			+ '<div class="msg">'
			+message.text 
			+'</div>'
						
			+'<br />'
			+'<small class="text-muted">'+message.user +'</small>'
			+ '<hr />'
			+'</div>'
		+'</div>'	 
	+'</li>';
	

	temp.innerHTML = htmlAsText;
	updateHistory(temp.firstChild, message);

	return temp.firstChild;
}

function updateCounter(){
	var messages = document.getElementsByClassName('history')[0];	
	var counter = document.getElementsByClassName('counter-holder')[0];		
	counter.innerText = messages.children.length.toString();	
}

function doPolling() {
	function loop() {
		var url = appState.mainUrl + '?token=' + appState.token;

		get(url, function(responseText) {
			var response = JSON.parse(responseText);

			appState.token = response.token;
			updateHistory(response.messages);
			setTimeout(loop, 1000);
			updateCounter();
		}, function(error) {
			defaultErrorHandler(error);
			setTimeout(loop, 1000);
		});
	}

	loop();
}

function defaultErrorHandler(message) {
	var historyBox = document.getElementsByClassName('history')[0];

	console.error(message);
	historyBox.innerText = 'ERROR:\n' + message + '\n';
}

function get(url, continueWith, continueWithError) {
	ajax('GET', url, null, continueWith, continueWithError);
}

function post(url, data, continueWith, continueWithError) {
	ajax('POST', url, data, continueWith, continueWithError);	
}

function isError(text) {
	if(text == "")
		return false;
	
	try {
		var obj = JSON.parse(text);
	} catch(ex) {
		return true;
	}

	return !!obj.error;
}

function ajax(method, url, data, continueWith, continueWithError) {
	var xhr = new XMLHttpRequest();

	continueWithError = continueWithError || defaultErrorHandler;
	xhr.open(method || 'GET', url, true);

	xhr.onload = function () {
		if (xhr.readyState !== 4)
			return;

		if(xhr.status != 200) {
			continueWithError('Error on the server side, response ' + xhr.status);
			return;
		}

		if(isError(xhr.responseText)) {
			continueWithError('Error on the server side, response ' + xhr.responseText);
			return;
		}

		continueWith(xhr.responseText);
	};    

	xhr.ontimeout = function () {
		ontinueWithError('Server timed out !');
	}

	xhr.onerror = function (e) {
		var errMsg = 'Server connection error ' + appState.mainUrl + '\n'+
		'\n' +
		'Check if \n'+
		'- server is active\n'+
		'- server sends header "Access-Control-Allow-Origin:*"';

		continueWithError(errMsg);
	};

	xhr.send(data);
}

window.onerror = function(err) {
	defaultErrorHandler(err.toString());
}
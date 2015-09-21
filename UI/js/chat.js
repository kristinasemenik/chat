'use strict';
$.noConflict();
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
		$('.media').hide();
		$('.media:contains('+query+')').show();
			query = '';
			updateCounter();
		}
	
	

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
	
	var htmlAsText = '<li class="media">'
	
		+'<div class="media-body" >'
			+'<div class="media">'
			+'<div class="btn-group-sm pull-right">'
				+'<button class="btn-one"  data-toggle="tooltip" data-placement="bottom" title="Спрятать"  >1</button>'
				+'<button class="btn-citate"  data-toggle="tooltip" data-placement="bottom" title="Цитировать">2</button>'
				+'<button class="btn-user_msgs"  data-toggle="tooltip" data-placement="bottom" title="Упрятать юзера">3</button>'
			+'</div>'
			+ message.text + '\n'		
						
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

//hiding toggled elements
window.onload = function()
		{
	var container = document.getElementById('hist');

    container.onclick = function(event) {
      if (!event.target.classList.contains('btn-one')) return;

      event.target.parentNode.parentNode.parentNode.hidden = !event.target.parentNode.parentNode.parentNode.hidden;
    }
   
};
            
    
	
	
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
var websocket, websocketTry=0;
connectWS();

function connectWS() {
	websocket = new WebSocket(GLOBAL_WEBSOCKET_URL);
	websocket.onopen = function(e) {
		console.log('Websocket connection established');
	};
	websocket.onclose = function(e) {
		websocketTry++;
		if(websocketTry>10) {
			console.log('Websocket connection error');
		}
		else connectWS();
	}
	websocket.onmessage = function(data) {
		data = JSON.parse(data.data);
		if(data.users.indexOf('['+$_USER['HSP_STAFF_PROFILE_ID']+']')>-1) chatboxRender(data, false, true);
	};
}

var ILIMS_Chatbox = localStorage.getItem('ILIMS_Chatbox')?JSON.parse(localStorage.getItem('ILIMS_Chatbox')):{};
jQuery.getJSON('libraries/chatbox/src/MyApp/GetNotification.php', function(rooms){
	for(r=0; r<rooms.length; r++) {
		if(
			!ILIMS_Chatbox[rooms[r].room] ||
			(
				ILIMS_Chatbox[rooms[r].room] &&
				moment(rooms[r].time, 'DD/MM/YYYY hh:mm:ssA').isAfter(moment(ILIMS_Chatbox[rooms[r].room]['latestMessage'], 'DD/MM/YYYY hh:mm:ssA'))
			)
		) {
			chatboxUpdateNotification(rooms[r], 'append');
		}
	}
});

function setChatbox(opt) {
	jQuery(opt.selector).addClass('chatbox').attr('room', opt.room).attr('need-data-simplebar', '').css({
		'max-height': opt.maxHeight+'px'
	});
	new SimpleBar(jQuery(opt.selector)[0]);
	
	CKEDITOR.config.toolbar = [['Bold', 'Italic']];
	jQuery(opt.selector).after('<div class="chatbox_editor"><div class="chatbox_quote d-none"></div><div class="chatbox_quote_cancel d-none" onclick="chatboxCancelReply(\''+opt.selector+'\')"><i class="icon-x"></i></div><div class="chatbox_send" onclick="chatboxSend(\''+opt.room+'\', \''+(opt.selector)+'\')"><i class="fa fa-paper-plane" aria-hidden="true"></i></div><div class="chatbox_textarea" id="'+(opt.selector.replace('#','')+'_editor')+'" contenteditable="true"></div></div>');
	
	jQuery.getJSON('libraries/chatbox/src/MyApp/GetHistory.php?room='+opt.room, function(data){
		if(data.room) {
			chatboxRender(data, false, false);
			chatboxUpdateNotification(opt, 'remove');
		}
	});
}

function chatboxRender(data, flash, animate) {
	//================================================== room currently on screen
	if(jQuery('.chatbox[room="'+data.room+'"]').length) {

		//============================================== put messages into container
		var uid = '';
		for(var i=0; i<data.message.length; i++) {
			jQuery('.chatbox[room="'+data.room+'"] .simplebar-content').append(
				'<div class="chatbox_msg'+(data.message[i].From==$_USER['HSP_STAFF_NAME']?' me':'')+'" id="'+(uid = data.message[i].Uid)+'">'+
					'<div class="chatbox_from font-weight-bold mb-1 mr-3"><span class="chatbox_timestamp">'+data.message[i].Time+'</span> '+data.message[i].From+'</div>'+
					'<div class="shown">'+
						'<a class="chatbox_menu pointer" data-toggle="dropdown"><i class="icon-chevron-down"></i></a>'+
						'<div class="dropdown-menu">'+
							'<a class="dropdown-item pointer" onclick="chatboxReply(\''+uid+'\')">'+($_USER['LANGUAGE']==1?'Balas':'Reply')+'</a>'+
						'</div>'+
					'</div>'+
					'<div class="chatbox_dialog">'+decodeURIComponent(data.message[i].Quote)+data.message[i].Message+'</div>'+
				'</div>'+
				'<div class="chatbox_seperator"></div>'
			);
		}
		
		//============================================== auto scroll to uid
		chatboxGoTo(uid, flash, animate);
		
		//============================================== save to localStorage
		if(!ILIMS_Chatbox[data.room]) ILIMS_Chatbox[data.room] = {};
		ILIMS_Chatbox[data.room]['latestMessage'] = data.message[data.message.length-1].Time;
		localStorage.setItem('ILIMS_Chatbox', JSON.stringify(ILIMS_Chatbox));
	}
	//================================================== else, show notification
	else {
		chatboxUpdateNotification(data, 'append');
	}
}

function chatboxGoTo(uid, flash, animate) {
	var targetMsg = jQuery('.chatbox #'+uid);
	if(targetMsg.length) {
		var targetScroll = jQuery('.chatbox #'+uid).closest('.chatbox').find('.simplebar-scroll-content');
		var targetLoc = targetMsg.offset().top - targetMsg.parent().offset().top - targetMsg.parent().scrollTop();
		
		if(!animate) targetScroll.scrollTop(targetLoc);
		else targetScroll.animate({ scrollTop: targetLoc }, 500, function(){ if(flash) jQuery('#'+uid).fadeOut(250).fadeIn(250); });
	}
}

function chatboxSend(room, selector) {
	ckeid = selector.replace('#','')+'_editor';
	
	if(CKEDITOR.instances[ckeid].getData()!='') {
		websocket.send(JSON.stringify({
			room: room,
			from: $_USER['HSP_STAFF_NAME'],
			quote: jQuery(selector+' + .chatbox_editor .chatbox_quote').not('.d-none').length?encodeURIComponent(jQuery(selector+' + .chatbox_editor .chatbox_quote').prop('outerHTML')):'',
			message: CKEDITOR.instances[ckeid].getData()
		}));
		CKEDITOR.instances[ckeid].setData('');
		chatboxCancelReply(selector);
	}
}

function chatboxReply(uid) {
	var quote = '';
	jQuery('.chatbox #'+uid+' .chatbox_dialog > p').each(function(){ quote += ' '+jQuery(this).text(); });
	jQuery('.chatbox #'+uid).closest('.chatbox').next().find('.chatbox_quote').attr('onclick', 'chatboxGoTo("'+uid+'", true, true)').html(jQuery('.chatbox #'+uid+' .chatbox_from').prop('outerHTML') + quote.substring(0, 100));
	jQuery('.chatbox #'+uid).closest('.chatbox').next().find('[class^=chatbox_quote]').removeClass('d-none');
	CKEDITOR.instances[jQuery('.chatbox #'+uid).closest('.chatbox').attr('id')+'_editor'].focus();
}

function chatboxCancelReply(selector) {
	jQuery('.chatbox'+selector).next().find('[class^=chatbox_quote]').addClass('d-none');
}

function chatboxUpdateNotification(data, type) {
	if(type=='append' && jQuery('.notificationContainer .dropdown-item[room="'+data.room+'"]').length==0) {
		jQuery('.notificationContainer .dropdown-menu').append('<a class="dropdown-item" room="'+data.room+'" href="'+data.url+'">'+($_USER['LANGUAGE']==1?'Mesej baru di ':'New message in ')+data.room+'</a>');
	}
	else if(type=='remove') {
		jQuery('.notificationContainer .dropdown-item[room="'+data.room+'"]').remove(); //clear notification
	}
	
	if(jQuery('.notificationContainer .dropdown-item').length) jQuery('.notificationContainer').removeClass('d-none');
	else jQuery('.notificationContainer').addClass('d-none');
}

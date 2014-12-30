// YOUR CODE HERE:
var room = "lobby";

var sanitize = function(object){
  for(keys in object){
    if (typeof object[keys] === "string") {
      var original = object[keys];
      object[keys] = encodeURI(object[keys]);
      object[keys] = object[keys].replace(/%20/g, " ");
      if (object[keys] !== original) {
        object[keys] = "*sanitized*";
      }
    }
  }
};

var display = function () {
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {
      order: "-createdAt",
      limit: 1000,
      where: {'roomname': room}
      // skip: 637
    },
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Messages retrieved');
      console.log(data);
      $('.chat').html('');
      for (var i = 0; i < data.results.length; i++) {
        var $li = $("<li>");
        $(".chat").append($li);
        sanitize(data.results[i]);
        var username = data.results[i].username;
        var msg =  data.results[i].text;
        var time = data.results[i].createdAt;
        $li.append("<span class = 'username'>" + username + "</span>");
        $li.append("<span class = 'msg'>" + msg + "</span>");
        $li.append("<span class = 'time'>" + time + "</span>");
      };

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
};
setInterval(display, 1000);

var sendMsg = function (message) {
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message');
    }
  });
};

var packageMsg = function (msg) {
  var user = window.location.search;
  user = user.slice(user.indexOf("username=") + 9)
  var cut = user.indexOf("&");
  if (cut > 0) {
    user = user.slice(0, cut);
  }

  var message = {
    'username': user,
    'text': msg,
    'roomname': room
  };
  console.log(message);
  sendMsg(message);
};

var getRooms = function() {
  var recentRooms = [];
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {
      order: "-createdAt",
      limit: 1000,
    },
    contentType: 'application/json',
    success: function (data) {
      recentRooms = [];
      var rooms = {};
      for(var i = 0; i<data.results.length; i++){
        var curRoom = data.results[i].roomname;
        if(!rooms[curRoom]){
          recentRooms.push(curRooms);
        }
        rooms[curRoom] = true;
      }

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
  var $roomSelector = $('.room');
  $.each(recentRooms, function(key, value) {
    $roomSelector
      .append($("<option></option>")
      .attr("value",key)
      .text(value));
  });
}
getRooms();
setInterval(getRooms, 5000);

$(document).ready(function() {
  $('.textSend').on('click', function(e) {
    var msg = $('.inputText').val();
    packageMsg(msg);
    $('.inputText').val('');
    display();
  });

  $('.room').on('change', function(e) {
    room = $('.room').val();
    display();
  });
})

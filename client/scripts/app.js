// YOUR CODE HERE:
var room = "lobby";
var friends = {};

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
      limit: 100,
      where: {'roomname': room}
    },
    contentType: 'application/json',
    success: function (data) {
      $('.chat').html('');
      for (var i = 0; i < data.results.length; i++) {
        var $li = $("<li>");
        $(".chat").prepend($li);
        sanitize(data.results[i]);
        var username = data.results[i].username;
        var msg = data.results[i].text;
        var time = moment(data.results[i].createdAt).fromNow();
        if (friends[username]) {
          $li.addClass("friend");
        }
        $li.append("<span class = 'username'>" + username + "</span>");
        $li.append("<span class = 'msg'>" + msg + "</span>");
        $li.append("<span class = 'time'>" + time + "</span>");
      };

      if (newRoom) {
        $('.chat').scrollTop( 9000 );
        newRoom = false;
      }

      $('.username').on('click', function(e) {
        var username = e.target.innerText;
        if (!friends[username]) {
          var $li = $("<li>");
          $(".friendslist ul").append($li);
          $li.text(username);
        }
        friends[username] = true;
      });

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
};
var newRoom = true;
display();
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
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    data: {
      order: "-createdAt",
      limit: 100,
    },
    contentType: 'application/json',
    success: function (data) {
      var rooms = {};
      var $roomSelector = $('.room');
      $roomSelector.html("");
      $roomSelector.append($("<option value='" + room + "'>" + room + "</option>"));
      rooms[room] = true;
      for(var i = 0; i<data.results.length; i++){
        var curRoom = data.results[i].roomname;
        var temp = {'a': curRoom};
        sanitize(temp);
        curRoom = temp.a;
        if(!rooms[curRoom]){
          $roomSelector
            .append($("<option></option>")
              .attr("value",curRoom)
              .text(curRoom)
            );
        }
        rooms[curRoom] = true;
      }

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
}
getRooms();
setInterval(getRooms, 5000);

$(document).ready(function() {
  $('.textSend').on('click', function() {
    var msg = $('.inputText').val();
    packageMsg(msg);
    $('.inputText').val('');
    display();
  });

  $('.room').on('change', function() {
    room = $('.room').val();
    newRoom = true;
    display();
  });

  $('.custom button').on('click', function() {
    room = $('.custom input').val();
    $('.custom input').val('');
    newRoom = true;
    display();
  });

  $(".friendslist").tooltip({
    items: "li",
    content: 'loading...',
    open: function() {
      var element = $(this);
      $.ajax({
        // always use this url
        url: 'https://api.parse.com/1/classes/chatterbox',
        type: 'GET',
        data: {
          order: "-createdAt",
          limit: 1,
          where: {'username': element.text()}
        },
        contentType: 'application/json',
        success: function (data) {
          var last = data.results[0];
          var lastroom = last.roomname;
          var time = moment(last.time).fromNow();
          element.tooltip({content: "Last post " + time + " in " + lastroom});
        }
      });
    }
  });

});

// YOUR CODE HERE:
var room = "lobby";
var friends = {};
var parseURL = 'https://api.parse.com/1/classes/chatterbox';

var sanitize = function(string){
  if (typeof string === "string") {
    var sanitized = string;
    sanitized = encodeURI(sanitized);
    sanitized = sanitized.replace(/%20/g, " ");
    if (sanitized !== string) {
      sanitized = "*sanitized*";
    }
    return sanitized
  }
};

var sanitizeObj = function(object) {
  for(keys in object){
    object[keys] = sanitize(object[keys]);
  }
};

var display = function () {
  $.ajax({
    url: parseURL,
    type: 'GET',
    contentType: 'application/json',
    data: {
      order: "-createdAt",
      limit: 100,
      where: {'roomname': room}
    },
    success: function (data) {
      $('.chat').html('');
      for (var i = 0; i < data.results.length; i++) {
        var $li = $("<li>");
        $(".chat").prepend($li);
        sanitizeObj(data.results[i]);
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
          friends[username] = true;
          $(".friendslist li").tooltip({
            items: "li",
            content: 'loading...',
            track: true,
            open: function() {
              var element = $(this);
              console.log(element.text());
              $.ajax({
                url: parseURL,
                type: 'GET',
                contentType: 'application/json',
                data: {
                  order: "-createdAt",
                  limit: 1,
                  where: {'username': element.text()}
                },
                success: function (data) {
                  var last = data.results[0];
                  if (last) {
                    var lastroom = last.roomname;
                    var time = moment(last.createdAt).fromNow();
                    element.tooltip({content: "Last post " + time + " in " + lastroom, });
                  } else {
                    element.tooltip({content: "Not found"});
                  }
                  setTimeout(function() {element.tooltip("close");
                    }, 2000);
                }
              });
            }
          });
        }
      });

    },
    error: function (data) {
      console.error('chatterbox: Failed to get message');
    }
  });
};
var newRoom = true;
display();
setInterval(display, 1000);

var sendMsg = function (message) {
  $.ajax({
    url: parseURL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(message),
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
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
    url: parseURL,
    type: 'GET',
    contentType: 'application/json',
    data: {
      order: "-createdAt",
      limit: 100,
    },
    success: function (data) {
      var rooms = {};
      var $roomSelector = $('.room');
      $roomSelector.html("");
      $roomSelector.append($("<option value='" + room + "'>" + room + "</option>"));
      rooms[room] = true;
      for(var i = 0; i<data.results.length; i++){
        var curRoom = sanitize(data.results[i].roomname);
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
      console.error('chatterbox: Failed to get rooms');
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
});

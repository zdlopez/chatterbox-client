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
  $.get(parseURL,
    {where: {'roomname': room}, limit: 100, order: "-createdAt"},
    function (data) {
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
              $.get(parseURL,
                {where: {'username': element.text()}, limit: 1, order: "-createdAt"},
                function (data) {
                  var last = data.results[0];
                  if (last) {
                    var time = moment(last.createdAt).fromNow();
                    element.tooltip({content: "Last post " + time + " in " + last.roomname });
                  } else {
                    element.tooltip({content: "Not found"});
                  }
                  setTimeout(function() {element.tooltip("close");}, 2000);
                }
              );
            }
          });
        }
      });

    }
  );
};
var newRoom = true;
display();
setInterval(display, 1000);

var send = function (text) {
  var user = window.location.search;
  var param = 'username';
  user = user.slice(user.indexOf(param) + param.length + 1)
  var ampPos = user.indexOf("&");
  if (ampPos > 0) {
    user = user.slice(0, ampPos);
  }
  var message = {
    'username': user,
    'text': text,
    'roomname': room
  };
  $.post(parseURL,
    JSON.stringify(message),
    function (data) {
      console.log('chatterbox: Message sent');
    }
  );
};

var getRooms = function() {
  $.get(parseURL,
    {limit: 100, order: "-createdAt"},
    function (data) {
      var rooms = {};
      rooms[room] = true;
      var $roomSelector = $('.room');
      $roomSelector.html($('<option value="' + room + '">' + room + '</option>'));
      for(var i = 0; i < data.results.length; i++){
        var aRoom = sanitize(data.results[i].roomname);
        if(!rooms[aRoom]){
          $roomSelector.append($('<option value="' + aRoom + '">' + aRoom + '</option>'));
          rooms[aRoom] = true;
        }
      }
    }
  );
}
getRooms();
setInterval(getRooms, 5000);

$(document).ready(function() {
  $('.textSend').on('click', function() {
    send($('.inputText').val());
    $('.inputText').val('');
    display();
  });

  $('.inputText').keypress(function(e) {
    if (e.keyCode === 13) {
      send($('.inputText').val());
      setTimeout(function() {$('.inputText').val(null);}, 0);
      display();
    }
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

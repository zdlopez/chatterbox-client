// YOUR CODE HERE:
var loaded = 0;

var display = function () {
  $.ajax({
    // always use this url
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Messages retrieved');
      //$("#messsages").html("");
      for (var i = loaded; i < data.results.length; i++, loaded++) {
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
      //loaded = i;

    },
    error: function (data) {
      // see: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to get message');
    }
  });
};
 setInterval(display, 1500);

var sanitize = function(object){
  for(keys in object){
    object[keys].replace('/</g', '&lt;');
  }
}

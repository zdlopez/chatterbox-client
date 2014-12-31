var room = "lobby";
var parseURL = 'https://api.parse.com/1/classes/chatterbox';

var Message = Backbone.Model.extend({
  initialize: function (username, text, createdAt, roomname) {
    this.set('username', username);
    this.set('text', text);
    this.set('createdAt', createdAt);
    this.set('roomname', roomname);
  }
});

var Friend = Backbone.Model.extend({
  initialize: function (username) {
    this.set('username', username);
  }
});

var Room = Backbone.Model.extend({
  initialize: function (roomname) {
    this.set('roomname', roomname);
  }
});

var MessageView = Backbone.View.extend({
  initialize: function () {
    // TODO event handler to click username to add friend
    // TODO event handler to update fromNow()
  },
  render: function () {
    var html = [
      "<li>",
        "<span class = 'username'>",
          this.model.get('username'),
        "</span>",
        "<span class = 'msg'>",
          this.model.get('msg'),
        "</span>",
        "<span class = 'time'>",
          // TODO human readable time
          this.model.get('createdAt'),
        "</span>",
      "</li>"
    ].join('');
    return this.$el.html(html);
  }
});

var FriendView = Backbone.View.extend({
  initialize: function () {
    // TODO hover tooltip event handler
  },
  render: function () {
    var html = [
      "<li>",
        this.model.get('username'),
      "</li>"
    ].join('');
    return this.$el.html(html);
  }
});

var RoomView = Backbone.View.extend({
  initialize: function () {
  },
  render: function() {
    var html = [
      "<option value='" + this.model.get('roomname') + "''>",
        this.model.get('roomname'),
      "</option>"
    ].join('');
    return this.$el.html(html);
  }
});

var Messages = Backbone.Collection.extend({
  model: Message
});

var Friends = Backbone.Collection.extend({
  model: Friend
});

var Rooms = Backbone.Collection.extend({
  model: Room
});

var MessagesView = Backbone.View.extend({
  initialize: function () {

  },
  render: function () {
    var html = [
    "<ul class='chat'>",
      // TODO move the map of messageView here
    "</ul>"
    ].join('');

    this.$el.html(html);

    this.$el.find('ul').append(
      this.model.map(function(message) {
        var messageView = new MessageView({model: message});
        return messageView.render();
      })
    );

    return this.$el;
  }
});

var FriendsView = Backbone.View.extend({
  initialize: function () {
  },
  render: function () {
    var html = [
    "<div class='friendslist'>",
      "<em>Friends:</em>",
      "<ul>",
        // TODO move the map of friendView here,
      "</ul>",
    "</div>"
    ].join('');

    this.$el.html(html);

    this.$el.find('ul').append(
      this.model.map(function(friend) {
        var friendView = new FriendView({model: friend});
        return friendView.render();
      })
    );

    return this.$el;
  }
});

var RoomsView = Backbone.View.extend({
  initialize: function () {
    // TODO add event handler for change <select>
  },
  render: function () {
    var html = [
      "<span class='custom'>",
        "<input type='text' placeholder='Custom room'>",
        "<button>Switch</button>",
      "</span>",
      "<span>Recent: </span>",
      "<select class='room' placeholder='lobby'>",
        // TODO move the map of roomView here,
      "</select>",
    ].join('');

    this.$el.html(html);

    this.$el.find('select').append(
      this.model.map(function(room) {
        var roomView = new RoomView({model: room});
        return roomView.render();
      })
    );

    return this.$el;
  }
});




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

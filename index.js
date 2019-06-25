const port      = process.env.PORT || 3000;
var   app       = require('express')();
var   http      = require('http').createServer(app);
var   io        = require('socket.io')(http);
var   nicknames = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var chatNickname = null;
  console.log('new user connected');

  // listen to nickname select request
  socket.on('nickname request', function (nickname) {
    console.log('user requested nick ' + nickname);
    if (nicknames.includes(nickname)) {
      console.log(`Nickname ${nickname} rejected (already exists)`);
      socket.emit('nickname rejected', {message: `Nickname ${nickname} already exists`});
    } else {
      nicknames.push(nickname);
      chatNickname = nickname;
      console.log(`Nickname ${nickname} accepted`);
      socket.emit('nickname accepted', {nickname});
      io.emit('users list', nicknames);
      io.emit('chat notification', {message: `${chatNickname} entered chat`});
    }
  });

  // listen to when user picks nickname and enteres chat
  socket.on('chat enter', function (nick){
    console.log(`user ${nick} entered chat`);
  });

  // listen to chat message
  socket.on('chat message', function (message) {
    io.emit('chat message', {nickname: chatNickname, message});
  });

  // listen to user disconnect
  socket.on('disconnect', function () {
    console.log(`user ${chatNickname} disconnected`);
    nicknames = nicknames.filter((nick) => nick !== chatNickname);
    io.emit('users list', nicknames);
    io.emit('chat notification', {message: `${chatNickname} left chat`});
  });

  // listen to user typing update
  socket.on('user typing', function (isTyping) {
    socket.broadcast.emit('user typing', {nickname: chatNickname, isTyping});
  });
});

http.listen(port, function () {
  console.log(`listening on port ${port}`);
});
const port        = process.env.SERVER_PORT || 3000
var   express     = require('express')
var   app         = express()
var   http        = require('http').createServer(app)
var   io          = require('socket.io')(http, {serveClient: false, pingInterval: 10000, cookie: false})
var   path        = require('path')
var   nicknames   = []
var   typingUsers = []

function validateNickname (name) {
  return /^[a-zA-Z0-9_\-]{2,30}$/.test(name)
}

function isNicknameAvailable (name) {
  return !nicknames.includes(name)
}

function emitUsersList () {
  var usersList = nicknames.map(function (nickname) {
    return {nickname, isTyping: typingUsers.includes(nickname)}
  })
  io.emit('users list', usersList)
}

function checkNickname (name) {
  console.log(`checking nick name ${name}`)
  if (!validateNickname(name)) {
    return "Nickname may contain only alphanumeric characters, digits, underscores and hyphens (2-30 chars)"
  }
  if (!isNicknameAvailable(name)) {
    return "Nickname is already taken"
  }
  return true
}

function acceptUser (name) {
  nicknames.push(name)
  emitUsersList()
  io.emit('chat message', {type: 'system_message', message: `User ${name} entered chat`})
}

function kickUser (name) {
  nicknames = nicknames.filter((nick) => nick !== name)
  emitUsersList()
  if (name !== null) {
    io.emit('chat message', {type: 'system_message', message: `User ${name} left chat`})
  }
}

io.on('connection', function(socket) {
  console.log('new user connected')

  var chatNickname = null;

  // enter chat with given name
  // if nickname is valid, emit 'chat enter ok to the socket, otherwise emit 'chat enter reject'
  socket.on('chat enter', function (name) {
    if (checkNickname(name) === true) {
      console.log(`user ${name} entered chat`)
      socket.emit('chat enter ok', {nickname: name})
      acceptUser(name)
      chatNickname = name
    } else {
      console.log(`user ${name} rejected`)
      socket.emit('chat enter reject', {message: checkNickname(name)})
    }
  })

  socket.on('chat leave', function () {
    console.log(`user ${chatNickname} left`)
    kickUser(chatNickname)
    chatNickname = null
  })

  // listen to chat message
  socket.on('chat message', function (message) {
    io.emit('chat message', {nickname: chatNickname, type: 'user_message', message})
  })

  // listen to user disconnect
  socket.on('disconnect', function () {
    console.log(`=== user ${chatNickname} disconnected`)
    kickUser(chatNickname)
    chatNickname = null
  })

  socket.on('reconnect', function () {
    console.log(`--- user ${chatNickname} reconnected`)
  })

  // listen to user typing update
  socket.on('user typing', function (isTyping) {
    var isCurrentlyTyping = typingUsers.includes(chatNickname)
    if (isTyping && !isCurrentlyTyping) {
      typingUsers.push(chatNickname);
      emitUsersList()
    } else if (!isTyping && isCurrentlyTyping) {
      typingUsers = typingUsers.filter((user) => user !== chatNickname)
      emitUsersList()
    }
  })
})

http.listen(port, function () {
  console.log(`listening on port ${port}`)
})

// Routing
app.use(express.static(path.join(__dirname, '../client/dist')));
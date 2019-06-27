<template>
    <div id="chat">
      <div id="messages">
        <div v-for="(message, index) in messages" v-bind:key="index">
          <span v-if="message.type == 'user_message'" class="user">{{message.nickname}}:</span>
          <span :class="'message ' + message.type">{{message.message}}</span>
        </div>
      </div>
      <div id="users-info">
        <div class="title">Users in chat ({{ usersCount }}):</div>
        <div v-for="user in users" v-bind:key="user.nickname">
          <span>{{user.nickname}}</span>
          <span v-if="user.nickname === nickname">(you)</span>
          <span v-if="user.isTyping && user.nickname !== nickname" class="typing-info">typing...</span>
        </div>
      </div>
      <div id="chat-input">
        <input type="text" v-focus v-model="message" autocomplete="off" v-on:keyup="updateTyping" v-on:keyup.enter="sendMessage" />
      </div>
      <div id="footer">
        <div class="app-info">WS CHAT - simple socket.io chat</div>
        <div class="logout"><a href="#" v-on:click.prevent="leaveChat">Leave</a></div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Chat',
  props: { nickname: String, socket: Object },
  data () {
    return {
      messages: [],
      message: '',
      typingUsers: [],
      users: []
    }
  },
  created () {
    var $vm = this

    this.socket.on('connect_error', (error) => {
      console.log('connect error', error)
      $vm.leaveChat()
    })

    // handle incoming chat messages
    this.socket.on('chat message', function (message) {
      $vm.messages.push(message)
    })

    // handle updating users list
    this.socket.on('users list', function (users) {
      console.log('users list', users)
      $vm.users = users
    })
  },
  updated () {
    // keep messages window scrolled to bottom to see the newest messages
    var messages = this.$el.querySelector('#messages')
    messages.scrollTop = messages.scrollHeight
  },
  computed: {
    usersCount () {
      return this.users.length
    }
  },
  methods: {
    sendMessage () {
      if (this.message.length === 0) {
        return
      }
      this.socket.emit('chat message', this.message)
      this.message = ''
      this.updateTyping()
    },
    updateTyping () {
      this.socket.emit('user typing', this.message.length > 0)
    },
    leaveChat () {
      console.log('leaving...')
      this.socket.emit('chat leave')
      this.$emit('leave-chat')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#chat {
  display: grid;
  grid-template-rows: auto 40px .8em;
  grid-template-columns: 3fr 1fr;
  grid-gap: 10px;
  height: calc(100vh - 16px);
  margin: 8px;
}
#messages {
  border-right: 3px solid #aaa;
  overflow: auto;
  padding-left: 4px;
}
#messages .user {
  font-weight: bold;
}
#messages .system_message {
  font-size: .9rem;
  font-style: italic;
  color: #555;
}
#users-info .title {
  font-weight: bold;
  margin-bottom: .5em;
}
#users-info .typing-info {
  font-size: .9em;
  color: #555;
  font-style: italic;
}
#chat-input {
  grid-column: 1/3;
}
#chat-input input {
  height: 40px;
  width: 100%;
}
#footer {
  grid-column: 1/3;
  font-size: .8em;
  color: #777;
  display: flex;
  justify-content: space-between;
  margin-top: -.5em;
}
</style>

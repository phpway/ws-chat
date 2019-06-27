<template>
  <div id="app">
    <Chat v-if="nickname"
      :nickname="nickname"
      :socket="socket"
      v-on:leave-chat="nickname = ''"
    />
    <Login v-else
      :socket="socket"
      v-on:set-nickname="nickname = $event"
    />
  </div>
</template>

<script>
import Chat from './components/Chat'
import Login from './components/Login'
import io from 'socket.io-client'
const socket = io('http://' + window.location.hostname + ':3000')

export default {
  name: 'App',
  data () {
    return {
      nickname: '',
      socket: socket
    }
  },
  components: {
    Chat,
    Login
  }
}
</script>

<style>
#app {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
input[type=text] {
  border: 2px solid #aaa;
  font-size: 1rem;
  padding-left: .5rem;
  box-sizing: border-box;
  border-radius: 7px;
}
</style>

<template>
    <div id="login">
      <div class="logo">WS CHAT</div>
      <div class="title">Pick Your Nickname:</div>
      <div class="input">
        <input type="text" v-focus v-model="nickname" v-on:keyup.enter="enterChat" v-on:keydown="clearError" ref="nickname" />
      </div>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
export default {
  name: 'login',
  props: {socket: Object},
  data () {
    return {
      nickname: '',
      errorMessage: ''
    }
  },
  created () {
    var $vm = this
    this.socket.on('chat enter ok', function ({ nickname }) {
      $vm.$emit('set-nickname', nickname)
    })
    this.socket.on('chat enter reject', function ({ message }) {
      $vm.errorMessage = message
    })
  },
  methods: {
    enterChat () {
      this.socket.emit('chat enter', this.nickname)
    },
    clearError () {
      this.errorMessage = ''
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#login {
  text-align: center;
}
.logo {
  margin-top: 30%;
  font-size: 5em;
  font-weight: bold;
}
.title {
  margin-top: 2em;
  margin-bottom: 4px;
  font-weight: 400;
}
.input input {
  height: 40px;
  width: 50%;
}
.error {
  margin-top: 4px;
  color:red;
  font-size: .9em;
}
</style>

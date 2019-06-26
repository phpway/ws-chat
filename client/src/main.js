import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: function (el) {
    // Focus the element
    el.focus()
  }
})

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})

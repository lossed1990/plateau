<template>
  <ul v-if=menus.visible class="gy-menu" v-bind:style="{ 'top': menus.top + 'px', 'left': menus.left + 'px' }">
    <li v-for="(menuitem, index) in menus.items" :key="index" class='gy-menu-item' :class="{ 'gy-menu-item-separation': menuitem === '' }" @click="onMenuClick(index, menuitem, menus.userdata)">
      {{menuitem}}
    </li>
  </ul>
</template>

<script>
  import '../../assets/scss/menu.scss'

  export default {
    props: ['menus'],
    data () {
      return {
      }
    },
    methods: {
      onMenuClick: function (index, name, userdata) {
        this.$emit('click-menu', index, name, userdata)
      }
    },
    mounted () {
      // 监听document鼠标事件，自动隐藏菜单
      let self = this
      document.addEventListener('mousedown', function (e) {
        if (e.target.className !== 'gy-menu' && e.target.className !== 'gy-menu-item') {
          self.menus.visible = false
        }
      })
    }
  }
</script>

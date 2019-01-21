<template>
  <ul v-if=menus.visible class="gy-menu" v-bind:style="{ 'top': menus.top + 'px', 'left': menus.left + 'px' }">
    <li v-for="(menuitem, index) in menus.items" :key="index" class='gy-menu-item' :class="{ 'gy-menu-item-separation': menuitem === '' }" @click="onMenuClick(menuitem, menus.userdata)">
      {{menuitem}}
    </li>
  </ul>
</template>

<script>
  export default {
    props: ['menus'],
    data () {
      return {
      }
    },
    methods: {
      onMenuClick: function (name, userdata) {
        this.$emit('click-menu', name, userdata)
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

<style scoped>
  .gy-menu {
    position: fixed;
    top: 200px;
    left: 140px;
    width: auto;
    min-width: 180px;
    z-index: 9999;
    border: 1px solid rgba(0,0,0,.15);
    border-radius: 4px;
    box-shadow: 0 6px 12px rgba(0,0,0,.175);
    -webkit-box-shadow: 0 6px 12px rgba(0,0,0,.175);
    background-clip: padding-box;
    list-style-type: none;
    margin: 0;
    padding: 4px 0px 4px 0px;
    background-color: white;
  }

  .gy-menu-item {
    list-style-type: none;
    font-family: "Segoe UI", "Arial", sans-serif;
    font-size: 12px;
    padding: 4px 4px 4px 24px;
    cursor: default;
  }

  .gy-menu-item:hover {
    background-color: rgb(238,238,238);
  }

  .gy-menu-item-separation {
    padding: 0px 0px 0px 0px;
    margin: 4px 0px 4px 0px;
    height:1px;
    background-color: rgb(237,237,237);
  }

  .gy-menu-item-separation:hover {
    background-color: rgb(237,237,237);
  }
</style>

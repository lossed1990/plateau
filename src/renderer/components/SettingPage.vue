<template>
  <el-container>
    <el-aside width="200px">
      <ul>
        <li><a href="#setting-theme" class="">主题</a></li>
        <li><a href="#setting-about" class="">关于</a></li>
      </ul>
    </el-aside>
    <el-main class="gy-setting">
      <h1>外观</h1>
      <p>
        <span>主题选择</span>
        <select v-model="currentTheme" @change="onChangeTheme">
          <option v-for="option in themes" v-bind:value="option.value">
            {{ option.text }}
          </option>
        </select>
      </p>
      <p>
        <span>字体大小</span>
      </p>
      <h1>系统</h1>
      <p>
        <span>工作区</span>
      </p>
      <p>
        <span>快捷键</span>
      </p>
      <h1>关于</h1>
    </el-main>
  </el-container>
</template>

<script>
  import '../assets/scss/setting-page.scss'
  import { mapState } from 'vuex'

  export default {
    data: function () {
      return {
        themes: [
          {text: '默认', value: 'default'},
          {text: '明亮', value: 'light'},
          {text: '黄色', value: 'yellow'},
          {text: '紫色', value: 'purple'},
          {text: '棕色', value: 'brown'},
          {text: '护眼', value: 'dark'}
        ],
        currentTheme: ''
      }
    },
    created: function () {
      this.$store.dispatch('showStatusBar', false)
      this.currentTheme = this.theme
    },
    computed: {
      ...mapState({
        theme: state => state.UIStore.currentTheme
      })
    },
    methods: {
      onChangeTheme: function (e) {
        document.body.setAttribute('theme', e.target.value)
        this.$store.dispatch('setTheme', e.target.value)
      }
    }
  }
</script>

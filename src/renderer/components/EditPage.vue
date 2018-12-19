<template>
  <div id="gy_edit">
    <div class="gy-leftcontainer-div" v-bind:style="{ width: leftListBarWidth + 'px' }">
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
      <p>12312</p>
    </div>
    <div class="gy-middlesplit-div" v-bind:style="{ left: splitLeft + 'px' }" @pointerdown="onMouseDown" @pointerup="onMouseUp"></div>
    <div class="gy-rightcontainer-div" v-bind:style="{ 'margin-left': splitRight + 'px' }">
      <codemirror
        ref="editor"
        :code="code"
        :options="editorOptions"
      />
    </div>
  </div>
</template>

<script>
  import editorOptions from '@/scripts/editor.js'
  import { mapState } from 'vuex'

  export default {
    data: function () {
      return {
        leftListBarWidth: 200,
        code: '',
        editorOptions
      }
    },
    computed: {
      splitLeft () {
        return this.leftListBarWidth + this.leftToolBarWidth
      },
      splitRight () {
        return this.splitLeft + 4 - this.leftToolBarWidth
      },
      ...mapState({
        leftToolBarWidth: state => state.UIStore.leftToolBarWidth
      })
    },
    methods: {
      onMouseDown: function (event) {
        console.log('onMouseDown')

        let dx = this.leftListBarWidth - event.clientX

        event.target.setPointerCapture(event.pointerId)
        event.target.onpointermove = (ev) => {
          console.log(ev)
          this.leftListBarWidth = ev.clientX + dx
          if (this.leftListBarWidth < 100) {
            this.leftListBarWidth = 100
          }

          if (this.leftListBarWidth > 500) {
            this.leftListBarWidth = 500
          }
          console.log('onMouseMove>>w:' + this.leftListBarWidth)
        }
      },
      onMouseUp: function (event) {
        console.log('onMouseUp')
        // Release the pointer capture
        event.target.releasePointerCapture(event.pointerId)
        event.target.onpointermove = null
      }
    }
  }
</script>

<style>
  #gy_edit {
    float: left;
    width: 100%;
  }

  .gy-leftcontainer-div {
    width: 196px;
    height: calc(100vh - 84px);
    /* background: tomato; */
    overflow-y: auto;
    position: fixed;
  }

  .gy-middlesplit-div {
    /* background: cornflowerblue; */
    left: 196px;
    border-left: 1px solid #EDEDED;
    width: 3px;
    height: calc(100vh - 84px);
    position: fixed;
    cursor: w-resize;
  }

  .gy-rightcontainer-div {
    margin-left: 200px;
    background-color: greenyellow;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: rgb(212, 213, 214);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background-color: rgb(212, 213, 214);
  }

  .vue-codemirror {
    /* background-color: rgb(59, 174, 250); */
    font-size: 18px;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    color: #606266;
    max-width: 800px;
    position: relative;
    margin: 0 auto;
  }

  .CodeMirror {
    height: 100%;
  }
  
  .CodeMirror .CodeMirror-lines {
    line-height: 32px;
  }
  
  .CodeMirror-cursor {
    background: #606266;
  }

  .CodeMirror .CodeMirror-gutters {
    border-right: 0px;
  }
</style>

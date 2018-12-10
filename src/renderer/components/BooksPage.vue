<template>
  <div id="books">
    <div v-if="workspace === ''" class="gy-workspace-set">
      <el-button type="primary" icon="el-icon-document" >选择工作目录</el-button>
      <p>良好的文档管理，从设置工作目录开始~</p>
    </div>
  </div>
</template>

<script>
  export default {
    data: function () {
      return {
        workspace: '',
        bookboxs: []
      }
    }
  }
</script>

<style>
  #books {
    float: left;
    width: 100%;
  }

  .gy-workspace-set {
    position: fixed;
    margin: auto;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 240px;
    height: 200px;
    text-align: center;
  }

  .gy-workspace-set .el-button {
    font-size: 22px;
  }
  
  .gy-workspace-set p {
    font-size: 13px;
    color: #C0C4CC;
  }
</style>

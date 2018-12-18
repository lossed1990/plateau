// 'use strict'

// export default function initIpc (ipcRenderer) {
//   /**
//    * 公共的ipc请求函数
//    * @param {String} method 请求方法名
//    * @param {String} param  请求json参数
//    * @param {String} callback 结果回调函数
//    */
//   window.ipcRequest = (method, param, callback) => {
//     try {
//       if (typeof param !== 'undefined') {
//         param = JSON.stringify(param)
//       }
//       console.log(method, param)
//       ipcRenderer.send('COMMON_IPC_REQUEST', method, param, callback)
//     } catch (e) {
//       console.log && console.log(arguments)
//     }
//   }

//   // 公共ipc请求反馈函数
//   /* eslint-disable */
//   ipcRenderer.on('COMMON_IPC_RESPONE', function (event, method, errCode, callback, response) {
//     try {
//       if (typeof errCode === 'undefined') {
//         console.log('ipc response error>>errCode is undefined')
//       } else if (errCode !== 0) {
//         console.log('ipc response error>>medthod:' + method + ';error:' + errCode + ';response:' + response)
//         window.showError(response.err_info)
//       } else {
//         if (callback) {
//           var data = JSON.stringify(response)
//           let script = callback + '(' + data + ')'
//           console.log('ipc response>>begin eval(' + script + ')')
//           eval(script)
//         }
//       }
//     } catch (e) {
//       console.log(e.toString(), response)
//     }
//   })
// }

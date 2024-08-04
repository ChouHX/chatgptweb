<script lang="ts" setup>
  //必须引入的核心
  import Recorder from 'recorder-core';

  //引入mp3格式支持文件；如果需要多个格式支持，把这些格式的编码引擎js文件放到后面统统引入进来即可
  import 'recorder-core/src/engine/mp3';
  import 'recorder-core/src/engine/mp3-engine';
  //录制wav格式的用这一句就行
  import 'recorder-core/src/engine/wav';

  //可选的插件支持项，这个是波形可视化插件
  import 'recorder-core/src/extensions/waveview';
import { ref } from 'vue';
  //ts import 提示：npm包内已自带了.d.ts声明文件（不过是any类型）
  let rec: any;
let recBlob: any;
let wave: any;
const recwave = ref(null);
// 打开录音
function recOpen() {
  //创建录音对象
  rec = Recorder({
    type: 'wav', //录音格式，可以换成wav等其他格式
    sampleRate: 16000, //录音的采样率，越大细节越丰富越细腻
    bitRate: 16, //录音的比特率，越大音质越好
    onProcess: (
      buffers: any,
      powerLevel: any,
      bufferDuration: any,
      bufferSampleRate: any,
      newBufferIdx: any,
      asyncEnd: any,
    ) => {
      //录音实时回调，大约1秒调用12次本回调
      //可实时绘制波形，实时上传（发送）数据
      if (wave) {
        wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
      }
    },
  });
  if (!rec) {
    alert('当前浏览器不支持录音功能！');
    return;
  }
  //打开录音，获得权限
  rec.open(
    () => {
      console.log('录音已打开');
      if (recwave.value) {
        //创建音频可视化图形绘制对象
        wave = Recorder.WaveView({ elem: recwave.value });
      }
    },
    (msg: any, isUserNotAllow: any) => {
      //用户拒绝了录音权限，或者浏览器不支持录音
      console.log((isUserNotAllow ? 'UserNotAllow，' : '') + '无法录音:' + msg);
    },
  );
}
// 开始录音
function recStart() {
  if (!rec) {
    console.error('未打开录音');
    return;
  }
  rec.start();
  console.log('已开始录音');
}
// 结束录音
function recStop() {
  if (!rec) {
    console.error('未打开录音');
    return;
  }
  rec.stop(
    (blob: any, duration: any) => {
      //blob就是我们要的录音文件对象，可以上传，或者本地播放
      recBlob = blob;
      //简单利用URL生成本地文件地址，此地址只能本地使用，比如赋值给audio.src进行播放，赋值给a.href然后a.click()进行下载（a需提供download="xxx.mp3"属性）
      const localUrl = (window.URL || window.webkitURL).createObjectURL(blob);
      console.log('录音成功', blob, localUrl, '时长:' + duration + 'ms');
      upload(blob); //把blob文件上传到服务器
      rec.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
      rec = null;
    },
    (err: any) => {
      console.error('结束录音出错：' + err);
      rec.close(); //关闭录音，释放录音资源，当然可以不释放，后面可以连续调用start
      rec = null;
    },
  );
}
// 上传录音
function upload(blob: any) {
  //使用FormData用multipart/form-data表单上传文件
  //或者将blob文件用FileReader转成base64纯文本编码，使用普通application/x-www-form-urlencoded表单上传
  // const form = new FormData();
  // form.append('upfile', blob, 'recorder.mp3'); // 和普通form表单并无二致，后端接收到upfile参数的文件，文件名为recorder.mp3
  // form.append('key', 'value'); // 其他参数
  // var xhr = new XMLHttpRequest();
  // xhr.open('POST', '/upload/xxxx');
  // xhr.onreadystatechange = () => {
  //   if (xhr.readyState == 4) {
  //     if (xhr.status == 200) {
  //       console.log('上传成功');
  //     } else {
  //       console.error('上传失败' + xhr.status);
  //     }
  //   }
  // };
  // xhr.send(form);
  // 也可以写自己的上传函数
  // uploadService(blob, 'zengjiaqi_test.wav');
}
// 本地播放录音
function recPlay() {
  //本地播放录音试听，可以直接用URL把blob转换成本地播放地址，用audio进行播放
  const localUrl = URL.createObjectURL(recBlob);
  const audio = document.createElement('audio');
  audio.controls = true;
  document.body.appendChild(audio);
  audio.src = localUrl;
  audio.play(); //这样就能播放了
  //注意不用了时需要revokeObjectURL，否则霸占内存
  setTimeout(function () {
    URL.revokeObjectURL(audio.src);
  }, 5000);
}

</script>
  
  <style scoped>
  button {
    margin: 5px;
  }
  </style>

  <template>
    <div>
      <div>
        <!-- 按钮 -->
        <button @click="recOpen">打开录音,请求权限</button>
        | <button @click="recStart">开始录音</button>
        <button @click="recStop">结束录音</button>
        | <button @click="recPlay">本地试听</button>
      </div>
      <div style="padding-top: 5px">
        <!-- 波形绘制区域 -->
        <div style="border: 1px solid #ccc; display: inline-block; vertical-align: bottom">
          <div style="height: 100px; width: 300px" ref="recwave"></div>
        </div>
      </div>
    </div>

  </template>
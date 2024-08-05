<script lang="ts" setup>
  import { NButton } from 'naive-ui';
  import { SvgIcon } from '@/components/common'
  import Recorder from 'recorder-core';
  import 'recorder-core/src/engine/wav';
  import 'recorder-core/src/extensions/waveview';
  import { ref } from 'vue';
  import { defineEmits } from 'vue'
  const emit = defineEmits(['recordingEnded'])
  let rec: any;
  let recBlob: any;
  let wave: any;
  const RecStatus = ref(false);

  function initializeWaveView() {
    const waveElement = document.getElementById('recwave');
    if (waveElement) {
      const rect = waveElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        wave = Recorder.WaveView({ elem: waveElement });
      } else {
        console.error('WaveView width or height is 0');
      }
    }
  }

  function recStart() {
    rec = Recorder({
      type: 'wav',
      sampleRate: 16000,
      bitRate: 16,
      onProcess: (
        buffers: any,
        powerLevel: any,
        bufferDuration: any,
        bufferSampleRate: any,
        newBufferIdx: any,
        asyncEnd: any,
      ) => {
        if (wave) {
          wave.input(buffers[buffers.length - 1], powerLevel, bufferSampleRate);
        }
      },
    });

    if (!rec) {
      alert('当前浏览器不支持录音功能！');
      return;
    }

    rec.open(
      () => {
        console.log('录音已打开');
        document.getElementById('recwave-container')!.style.display = 'flex';
        initializeWaveView();
        rec.start();
        RecStatus.value = true;
        console.log('已开始录音');
      },
      (msg: any, isUserNotAllow: any) => {
        alert((isUserNotAllow ? 'UserNotAllow，' : '') + '无法录音:' + msg);
      },
    );
  }

  function recStop() {
    if (!rec) {
      console.error('未打开录音');
      return;
    }
    RecStatus.value = false;
    document.getElementById('recwave-container')!.style.display = 'none';

    rec.stop(
      (blob: any, duration: any) => {
        recBlob = blob;
        const localUrl = (window.URL || window.webkitURL).createObjectURL(blob);
        console.log('录音成功', blob, localUrl, '时长:' + duration + 'ms');
        upload(blob);
        rec.close();
        rec = null;
        recPlay(); // 在这里调用 recPlay，确保 recBlob 已经更新
      },
      (err: any) => {
        console.error('结束录音出错：' + err);
        rec.close();
        rec = null;
      },
    );
    emit('recordingEnded', 'Success')
  }

  function upload(blob: any) {
    console.log('上传录音', blob);
  }

  function recPlay() {
    const localUrl = URL.createObjectURL(recBlob);
    const audio = new Audio(localUrl);
    audio.play();
    setTimeout(() => {
      URL.revokeObjectURL(audio.src);
    }, 5000);
  }
</script>

<template>
  <NButton 
  @click="!RecStatus ? recStart() : recStop()" 
  :type="!RecStatus ? 'primary' : 'error'" 
  >
    <span class="text-xl">
      <SvgIcon icon="ant-design:audio-outlined" />
    </span>
  </NButton>
  <!-- <button @click="recPlay" class="btn" :disabled="RecStatus">本地试听</button> -->
  <div id="recwave-container" class="wave-container">
    <div id="recwave" class="wave-display"></div>
  </div>
</template>

<style scoped>
.wave-container {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 10%;
  top: 60%;
  z-index: 999;
  justify-content: center;
  align-items: center;
}

.wave-display {
  width: 90%;
  height: 90%;
}
</style>

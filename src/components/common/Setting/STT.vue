<script lang="ts" setup>
import { NButton } from 'naive-ui';
import { SvgIcon } from '@/components/common';
import { ref } from 'vue';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { fetchAzureToken } from '@/api';


// now create the speech config with the credentials for the subscription
const res = await fetchAzureToken();
const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(res.data[0], res.data[1]);
speechConfig.speechRecognitionLanguage = 'zh-CN';
const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
function newRec(){
  const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  speechRecognizer.recognizing = (s, e) => {
    // console.log(`RECOGNIZING: Text=${e.result.text}`);
    emit('recordingEnded', e.result.text);
  };
  speechRecognizer.recognized = (s, e) => {
    if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
      // console.log(`RECOGNIZED: Text=${e.result.text}`);
      speechRecognizer.stopContinuousRecognitionAsync();
      RecStatus.value = false;
    } else if (e.result.reason == sdk.ResultReason.NoMatch) {
      // console.log('NOMATCH: Speech could not be recognized.');
      speechRecognizer.stopContinuousRecognitionAsync();
      RecStatus.value = false;
    }
  };
  speechRecognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);

    if (e.reason == sdk.CancellationReason.Error) {
      console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
      console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
      console.log('CANCELED: Did you set the speech resource key and region values?');
    }

    speechRecognizer.stopContinuousRecognitionAsync();
  };

  speechRecognizer.sessionStopped = (s, e) => {
    // console.log('\n    Session stopped event.');
    speechRecognizer.stopContinuousRecognitionAsync();
  };
  return speechRecognizer
}



const emit = defineEmits(['recordingEnded']);
const RecStatus = ref(false);
const IsLoading = ref(false);
async function recStart() {
  IsLoading.value = true;
  const res = await fetchAzureToken();
  IsLoading.value = false;
  speechConfig.authorizationToken = res.data[0];
  const speechRecognizer = newRec();
  speechRecognizer.startContinuousRecognitionAsync();
  RecStatus.value = true;
}
</script>

<template>
  <NButton
    quaternary
    circle 
    :loading="IsLoading"
    :disabled="RecStatus"
    @click="recStart"
    :type="!RecStatus ? 'primary' : 'error'"
    :class="{ 'blinking': RecStatus }"
  >
    <span class="text-xl">
      <SvgIcon :icon="!RecStatus ? 'ant-design:audio-outlined' : 'lucide:speech'" />
    </span>
  </NButton>
</template>

<style scoped>
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .blinking {
    animation: blink 1s infinite;
  }
</style>

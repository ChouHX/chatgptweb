<script lang="ts" setup>
import { h, ref, watch } from 'vue'
import type { SelectRenderLabel } from 'naive-ui'
import { NAvatar, NButton, NSelect, NSlider, NText, useMessage } from 'naive-ui'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'

const settingStore = useSettingStore()

const ms = useMessage()

const provider = ref(settingStore.tts_provider ?? 'Azure')
const ttsModel = ref(settingStore.tts_model ?? 'zh-CN-XiaoxiaoMultilingualNeural')
const speed = ref(settingStore.tts_speed ?? 1)
const renderProviderLabel: SelectRenderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      h(NAvatar, {
        style: { backgroundColor: 'white' },
        src: option.value === 'Azure' ? '/azure.svg' : '/favicon-192x192.png',
        round: true,
        size: 'small',
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0',
          },
        },
        [
          h('div', null, [option.label as string]),
          h(
            NText,
            { depth: 3, tag: 'div' },
          ),
        ],
      ),
    ],
  )
}
const renderModelLabel: SelectRenderLabel = (option) => {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
      },
    },
    [
      h(NAvatar, {
        src: option.sex === 'female' ? '/female.svg' : '/male.svg',
        style: { backgroundColor: 'white' },
        round: true,
        size: 'small',
      }),
      h(
        'div',
        {
          style: {
            marginLeft: '12px',
            padding: '4px 0',
          },
        },
        [
          h('div', null, [option.label as string]),
          h(
            NText,
            { depth: 3, tag: 'div' },
          ),
        ],
      ),
    ],
  )
}
const openaiModels = [
  {
    label: 'Alloy',
    sex: 'female',
    value: 'alloy',
  },
  {
    label: 'Echo',
    sex: 'male',
    value: 'echo',
  },
  {
    label: 'Fable',
    sex: 'female',
    value: 'fable',
  },
  {
    label: 'Onyx',
    sex: 'male',
    value: 'onyx',
  },
  {
    label: 'Nova',
    sex: 'female',
    value: 'nova',
  },
  {
    label: 'Shimmer',
    sex: 'female',
    value: 'shimmer',
  },
]
const azureModels = [
  {
    label: '晓晓',
    sex: 'female',
    value: 'zh-CN-XiaoxiaoMultilingualNeural',
  },
  {
    label: '晓辰',
    sex: 'female',
    value: 'zh-CN-XiaochenMultilingualNeural',
  },
  {
    label: '晓宇',
    sex: 'female',
    value: 'zh-CN-XiaoyuMultilingualNeural',
  },
  {
    label: '云逸',
    sex: 'male',
    value: 'zh-CN-YunyiMultilingualNeural',
  },
  {
    label: 'Ada',
    sex: 'female',
    value: 'en-GB-AdaMultilingualNeural',
  },
  {
    label: 'Ava',
    sex: 'female',
    value: 'en-US-AvaMultilingualNeural',
  },
  {
    label: 'Jenny',
    sex: 'female',
    value: 'en-US-JennyMultilingualNeural',
  },
  {
    label: 'Nova-Turbo',
    sex: 'female',
    value: 'en-US-NovaTurboMultilingualNeural',
  },
  {
    label: 'Andrew',
    sex: 'male',
    value: 'en-US-AndrewMultilingualNeural',
  },
  {
    label: 'Alloy-Turbo',
    sex: 'male',
    value: 'en-US-AlloyTurboMultilingualNeural',
  },
]

// Watch for changes to the provider and reset ttsModel to the first model of the selected provider
watch(provider, (newProvider) => {
  ttsModel.value = newProvider === 'Azure' ? azureModels[0].value : openaiModels[0].value
})

function updateSettings() {
  const options: Partial<SettingsState> = {
    tts_provider: provider.value,
    tts_model: ttsModel.value,
    tts_speed: speed.value,
  }
  // console.log(options)
  settingStore.updateSetting(options)
  ms.success(t('common.success'))
}

function handleReset() {
  settingStore.resetSetting()
  ms.success(t('common.success'))
  window.location.reload()
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">Provider</span>
        <div class="flex-1">
          <NSelect
            v-model:value="provider"
            :render-label="renderProviderLabel"
            :options="[{ label: 'Azure', value: 'Azure' }, { label: 'Openai', value: 'Openai' }]"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">Model</span>
        <div class="flex-1">
          <NSelect
            v-model:value="ttsModel"
            :render-label="renderModelLabel"
            :options="provider === 'Azure' ? azureModels : openaiModels"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">Speed</span>
        <div class="flex-1">
          <NSlider v-model:value="speed" :max="2" :min="0.5" :step="0.1" />
        </div>
        <span>{{ speed }}</span>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">&nbsp;</span>
        <NButton size="small" type="primary" @click="updateSettings">
          {{ $t('common.save') }}
        </NButton>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>
    </div>
  </div>
</template>

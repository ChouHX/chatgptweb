<script lang="ts" setup>
import { h, ref } from 'vue'
import type { SelectRenderLabel } from 'naive-ui'
import { NAvatar, NButton, NInput, NSelect, NSlider, NText, useMessage } from 'naive-ui'
import { useSettingStore } from '@/store'
import { t } from '@/locales'
import type { SettingsState } from '@/store/modules/settings/helper'

const settingStore = useSettingStore()

const ms = useMessage()

const model = ref(settingStore.model ?? 'gpt-4o-mini')
const systemMessage = ref(settingStore.systemMessage ?? '')

const temperature = ref(settingStore.temperature ?? 0.5)

const top_p = ref(settingStore.top_p ?? 1)

const models = [

  {
    label: 'GPT-3.5',
    value: 'text-davinci-002-render-sha',
  },
  {
    label: 'GPT-4',
    value: 'gpt-4',
  },
  {
    label: 'GPT-4o-mini',
    value: 'gpt-4o-mini',
  },
  {
    label: 'GPT-4o',
    value: 'gpt-4o',
  },
  {
    label: 'GPT-4-Mobile',
    value: 'gpt-4-mobile',
  },
]

const renderLabel: SelectRenderLabel = (option) => {
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
        src: 'favicon-192x192.png',
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
            // {
            //   default: () => 'description'
            // }
          ),
        ],
      ),
    ],
  )
}
function updateSettings(options: Partial<SettingsState>) {
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
        <span class="flex-shrink-0 w-[120px]">Model</span>
        <div class="flex-1">
          <NSelect v-model:value="model" :options="models" :render-label="renderLabel" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ model })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.role') }}</span>
        <div class="flex-1">
          <NInput v-model:value="systemMessage" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateSettings({ systemMessage })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.temperature') }} </span>
        <div class="flex-1">
          <NSlider v-model:value="temperature" :max="2" :min="0" :step="0.1" />
        </div>
        <span>{{ temperature }}</span>
        <NButton size="tiny" text type="primary" @click="updateSettings({ temperature })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">{{ $t('setting.top_p') }} </span>
        <div class="flex-1">
          <NSlider v-model:value="top_p" :max="1" :min="0" :step="0.1" />
        </div>
        <span>{{ top_p }}</span>
        <NButton size="tiny" text type="primary" @click="updateSettings({ top_p })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">&nbsp;</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>
    </div>
  </div>
</template>

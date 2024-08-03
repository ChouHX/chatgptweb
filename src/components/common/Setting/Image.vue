<script lang="ts" setup>
import { ref, watch } from 'vue'
import { NButton, NSelect, useMessage } from 'naive-ui'
import { useSettingStore } from '@/store'
import type { SettingsState } from '@/store/modules/settings/helper'
import { t } from '@/locales'

const settingStore = useSettingStore()

const ms = useMessage()

const img_model = ref(settingStore.image_model ?? 'dall-e-3')
const img_size = ref(settingStore.image_size ?? '1024x1024')
const img_style = ref(settingStore.image_style ?? 'natural')

const imageSize_DALLE2 = [
  {
    label: '256x256',
    value: '256x256',
  },
  {
    label: '512x512',
    value: '512x512',
  },
  {
    label: '1024x1024',
    value: '1024x1024',
  },

]
const imageSize_DALLE3 = [
  {
    label: '1024x1024',
    value: '1024x1024',
  },
  {
    label: '1792x1024',
    value: '1792x1024',
  },
  {
    label: '1024x1792',
    value: '1024x1792',
  },
]

// Watch for changes to the Models
watch(img_model, (newModel) => {
  // 根据新的 model 值选择相应的 size 选项
  if (newModel === 'dall-e-3')
    img_size.value = imageSize_DALLE3[0].value
  else
    img_size.value = imageSize_DALLE2[0].value
})

function updateSettings() {
  const options: Partial<SettingsState> = {
    image_model: img_model.value,
    image_size: img_size.value,
    image_style: img_style.value,
  }
  //   console.log(options)
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
          <NSelect
            v-model:value="img_model"
            :options="[{ label: 'DALL-E-2', value: 'dall-e-2' }, { label: 'DALL-E-3', value: 'dall-e-3' }]"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">Size</span>
        <div class="flex-1">
          <NSelect
            v-model:value="img_size"
            :options="img_model === 'dall-e-3' ? imageSize_DALLE3 : imageSize_DALLE2"
          />
        </div>
      </div>
      <div v-if="img_model === 'dall-e-3'" class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[120px]">Style</span>
        <div class="flex-1">
          <NSelect
            v-model:value="img_style"
            :options="[{ label: 'Natural', value: 'natural' }, { label: 'Vivid', value: 'vivid' }]"
          />
        </div>
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

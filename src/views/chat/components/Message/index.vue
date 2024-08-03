<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { NButton, NDropdown, NIcon, useMessage } from 'naive-ui'
import { PauseCircle, PlayCircle } from '@vicons/ionicons5'

import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import { SvgIcon } from '@/components/common'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { copyToClip } from '@/utils/copy'
import { useSettingStore } from '@/store'
import { fetchTTSAPI } from '@/api'

interface Props {
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
}

interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { isMobile } = useBasicLayout()

const { iconRender } = useIconRender()

const message = useMessage()

const textRef = ref<HTMLElement>()

const asRawText = ref(props.inversion)

const messageRef = ref<HTMLElement>()

const options = computed(() => {
  const common = [
    {
      label: t('chat.copy'),
      key: 'copyText',
      icon: iconRender({ icon: 'ri:file-copy-2-line' }),
    },
    {
      label: t('common.delete'),
      key: 'delete',
      icon: iconRender({ icon: 'ri:delete-bin-line' }),
    },
  ]

  if (!props.inversion) {
    common.unshift({
      label: asRawText.value ? t('chat.preview') : t('chat.showRawText'),
      key: 'toggleRenderType',
      icon: iconRender({ icon: asRawText.value ? 'ic:outline-code-off' : 'ic:outline-code' }),
    })
  }

  return common
})

function handleSelect(key: 'copyText' | 'delete' | 'toggleRenderType') {
  switch (key) {
    case 'copyText':
      handleCopy()
      return
    case 'toggleRenderType':
      asRawText.value = !asRawText.value
      return
    case 'delete':
      emit('delete')
  }
}

function handleRegenerate() {
  messageRef.value?.scrollIntoView()
  emit('regenerate')
}

async function handleCopy() {
  try {
    await copyToClip(props.text || '')
    message.success(t('chat.copied'))
  }
  catch {
    message.error(t('chat.copyFailed'))
  }
}

const settingStore = useSettingStore()
const audio = ref<HTMLAudioElement | null>(null)
let LatestMsg: string | null | undefined = null
const isPlaying = ref(false)
const isLoading = ref(false)
// Watch for changes in settingStore and refetch audio if necessary
watch(
  () => [settingStore.tts_model, settingStore.tts_speed],
  () => {
    // If the settings change and there's an ongoing message, refetch audio
    LatestMsg = ''
  },
  { immediate: true }, // Ensure to check settings on initialization
)
async function FetchAudio(msg: string) {
  LatestMsg = msg
  try {
    const res = await fetchTTSAPI(settingStore.tts_provider, msg, settingStore.tts_model, settingStore.tts_speed)
    const audioUrl = `data:audio/mp3;base64,${res.data}`

    audio.value = new Audio(audioUrl)
    audio.value.play()

    // Update play state
    isPlaying.value = true
    isLoading.value = false

    audio.value.onended = () => {
      isPlaying.value = false // Reset play state when audio ends
    }
  }
  catch (error) {
    console.error('Error fetching and playing audio:', error)
  }
}
async function handleTTS() {
  const { text } = props
  if (isPlaying.value) {
    audio.value?.pause()
    isPlaying.value = false
  }
  else {
    if (LatestMsg === text) {
      audio.value?.play()
      isPlaying.value = true
    }
    else {
      isLoading.value = true
      FetchAudio(text ?? 'Error')
    }
  }
}
</script>

<template>
  <div
    ref="messageRef"
    class="flex w-full mb-6 overflow-hidden"
    :class="[{ 'flex-row-reverse': inversion }]"
  >
    <div
      class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']"
    >
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm" :class="[inversion ? 'items-end' : 'items-start']">
      <div class="flex gap-3 items-center">
        <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
          {{ dateTime }}
        </p>
        <NButton
          v-if="!inversion" secondary
          circle
          :loading="isLoading"
          style="height: 25px;width: 25px;"
          :type="!isPlaying ? 'success' : 'error'"
          class="flex items-center text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
          @click="handleTTS"
        >
          <template #icon>
            <NIcon>
              <component :is="isPlaying ? PauseCircle : PlayCircle" />
            </NIcon>
          </template>
        </NButton>
      </div>
      <div
        class="flex items-end gap-1 mt-2"
        :class="[inversion ? 'flex-row-reverse' : 'flex-row']"
      >
        <TextComponent
          ref="textRef"
          :inversion="inversion"
          :error="error"
          :text="text"
          :loading="loading"
          :as-raw-text="asRawText"
        />
        <div class="flex flex-col">
          <button
            v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate"
          >
            <SvgIcon icon="ri:restart-line" />
          </button>
          <NDropdown
            :trigger="isMobile ? 'click' : 'hover'"
            :placement="!inversion ? 'right' : 'left'"
            :options="options"
            @select="handleSelect"
          >
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>

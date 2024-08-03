<script setup lang='ts'>
import { defineAsyncComponent, ref } from 'vue'
import { NButton } from "naive-ui";
import { HoverButton, SvgIcon, UserAvatar } from '@/components/common'
import { useAppStore } from '@/store'

const Setting = defineAsyncComponent(() => import('@/components/common/Setting/index.vue'))

const show = ref(false)

const appStore = useAppStore()
const isDark = ref(false)

</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <div class="flex-1 flex-shrink-0 overflow-hidden">
      <UserAvatar />
    </div>
    <NButton
       circle
      size="small"

      @click="isDark=!isDark;appStore.setTheme(isDark ? 'dark' : 'light')"
    >
      <template #icon>
        <SvgIcon :icon="isDark ? 'ri:moon-foggy-line' : 'ri:sun-foggy-line'" />
      </template>
    </NButton>
    <HoverButton @click="show = true">
      <span class="text-xl text-[#4f555e] dark:text-white">
        <SvgIcon icon="ri:settings-4-line" />
      </span>
    </HoverButton>

    <Setting v-if="show" v-model:visible="show" />
  </footer>
</template>

import { ss } from '@/utils/storage'

const LOCAL_NAME = 'settingsStorage'

export interface SettingsState {
  model: string
  systemMessage: string
  temperature: number
  top_p: number
  tts_provider: string
  tts_model: string
  tts_speed: number
  image_model: string
  image_size: string
  image_style: string
}

export function defaultSetting(): SettingsState {
  return {
    model: 'gpt-4o-mini',
    systemMessage: 'You are ChatGPT, a large language model trained by OpenAI. Follow the user\'s instructions carefully. Respond using markdown.',
    temperature: 0.8,
    top_p: 1,
    tts_provider: 'Azure',
    tts_model: 'zh-CN-XiaoxiaoMultilingualNeural',
    tts_speed: 1,
    image_model: 'dall-e-3',
    image_size: '1024x1024',
    image_style: 'natural',
  }
}

export function getLocalState(): SettingsState {
  const localSetting: SettingsState | undefined = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalState(setting: SettingsState): void {
  ss.set(LOCAL_NAME, setting)
}

export function removeLocalState() {
  ss.remove(LOCAL_NAME)
}

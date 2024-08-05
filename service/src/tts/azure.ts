const azure_region = process.env.AZURE_API_REGION
const azure_key = process.env.AZURE_API_KEY
const AZURE_TOKEN_ENDPOINT = `https://${azure_region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`

export function generateSSML(message: string, voiceName: string, rate: number): string {
  const SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
        <voice name="${voiceName}">
            <mstts:express-as styleDegree="1">
                <prosody volume="0%" rate="${rate}" pitch="0%">
                    ${message}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>`
  return SSML
}

export async function fetchAudio(msg: string, voice: string, speed: number) {
  const url = `https://${azure_region}.tts.speech.microsoft.com/cognitiveservices/v1`
  const ssml = generateSSML(msg, voice, speed)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': azure_key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'curl',
    },
    body: ssml,
  })

  if (!response.ok)
    throw new Error(`Error fetching audio: ${response.statusText}`)

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  return buffer
}

let cachedToken: string | null = null
let tokenExpiration: Date | null = null
export async function fetchToken(): Promise<string[]> {
  if (!cachedToken || !tokenExpiration || tokenExpiration <= new Date()) {
    const res = await fetch(AZURE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': azure_key,
      },
    })

    if (!res.ok)
      throw new Error(`Error fetching token. Error code: ${res.status}`)

    cachedToken = await res.text()
    tokenExpiration = new Date(new Date().getTime() + 600 * 1000) // 20s
  }

  return [cachedToken, azure_region]
}

const tts_region = process.env.AZURE_TTS_REGION
const tts_key = process.env.AZURE_TTS_KEY

export function generateSSML(message: string, voiceName: string, rate: number): string {
  const SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
        <voice name="${voiceName}">
            <mstts:express-as styleDegree="1">
                <prosody volume="0%" rate="${rate}" pitch="0%">
                    ${message}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>`;
  return SSML;
}

export async function fetchAudio(msg:string,voice:string,speed:number) {
  const url = `https://${tts_region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = generateSSML(msg,voice,speed)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': tts_key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'curl',
    },
    body: ssml,
  });

  if (!response.ok) {
    throw new Error(`Error fetching audio: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return buffer;
}

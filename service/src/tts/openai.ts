import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
type Model = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export async function OpenaiTTS(text: string,voiceName:string,rate:number) {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: voiceName as Model,
    input: text,
    speed: rate,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  return buffer;
}

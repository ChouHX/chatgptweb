import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
type imgSize = "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
type imgStyle = "natural" | "vivid";

export async function GenerateImages(prompt: string,model:string, size?: string, style?: string) {
  const options: any = {
    model: model, 
    prompt: prompt,
    n: 1
  };

  if (size) {
    options.size = size as imgSize;
  }

  if (style) {
    options.style = style as imgStyle;
  }

  const image = await openai.images.generate(options);
  return image.data;
}

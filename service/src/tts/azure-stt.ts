import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as wav from 'wav';
import { Request, Response } from 'express';

// 从环境变量中获取配置
const API_KEY = process.env.AZURE_API_KEY;
const region = process.env.AZURE_API_REGION;

if (!API_KEY || !region) {
  throw new Error('Azure API Key and Region must be set in environment variables');
}

// 配置 Azure Speech SDK
const speechConfig = sdk.SpeechConfig.fromSubscription(API_KEY, region);
speechConfig.speechRecognitionLanguage = 'zh-CN';

function recognizeFromMic(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // 写入 WAV 文件头
    let writer = new wav.Writer({
      sampleRate: 32000,
      channels: 1,
      bitDepth: 16,
    });
    
    // 将缓冲区数据写入 WAV 写入器
    writer.write(buffer);
    writer.end();
    
    writer.on('finish', () => {
      // 读取 WAV 数据并进行语音识别
      let audioConfig = sdk.AudioConfig.fromWavFileInput(writer.read());
      let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      
      recognizer.recognizeOnceAsync(result => {
        recognizer.close();
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          resolve(result.text);
        } else {
          reject(new Error(`Speech recognition failed: ${result.errorDetails}`));
        }
      }, error => {
        recognizer.close();
        reject(new Error(`Speech recognition error: ${error}`));
      });
    });
  });
}

// Express 路由处理函数
export async function handleSpeechToText(req: Request, res: Response) {
  try {
    const buffer = req.body.audio; // 假设音频数据以二进制形式发送在请求体中
    if (!buffer) {
      return res.status(400).json({ error: 'No audio buffer provided' });
    }
    
    const text = await recognizeFromMic(Buffer.from(buffer, 'base64'));
    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

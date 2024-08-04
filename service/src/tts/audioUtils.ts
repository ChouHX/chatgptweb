import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import * as fs from 'fs';

// TypeScript 类型定义
interface WavFileHeader {
  framerate: number;
  bitsPerSample: number;
  nChannels: number;
  tag: number;
}

// 读取 32 位整数
function readInt32(fd: number): number {
  const buffer = Buffer.alloc(4);
  const bytesRead = fs.readSync(fd, buffer);
  if (bytesRead !== 4) {
    throw new Error(`Error reading 32-bit integer from .wav file header. Expected 4 bytes. Actual bytes read: ${bytesRead}`);
  }
  return buffer.readInt32LE();
}

// 读取 16 位无符号整数
function readUInt16(fd: number): number {
  const buffer = Buffer.alloc(2);
  const bytesRead = fs.readSync(fd, buffer);
  if (bytesRead !== 2) {
    throw new Error(`Error reading 16-bit unsigned integer from .wav file header. Expected 2 bytes. Actual bytes read: ${bytesRead}`);
  }
  return buffer.readUInt16LE();
}

// 读取 32 位无符号整数
function readUInt32(fd: number): number {
  const buffer = Buffer.alloc(4);
  const bytesRead = fs.readSync(fd, buffer);
  if (bytesRead !== 4) {
    throw new Error(`Error reading unsigned 32-bit integer from .wav file header. Expected 4 bytes. Actual bytes read: ${bytesRead}`);
  }
  return buffer.readUInt32LE();
}

// 读取指定长度的字符串
function readString(fd: number, length: number): string {
  const buffer = Buffer.alloc(length);
  const bytesRead = fs.readSync(fd, buffer);
  if (bytesRead !== length) {
    throw new Error(`Error reading string from .wav file header. Expected ${length} bytes. Actual bytes read: ${bytesRead}`);
  }
  return buffer.toString();
}

// 打开推流
export const openPushStream = (filename: string): sdk.PushAudioInputStream => {
  // 获取 wav 文件头
  const wavFileHeader = readWavFileHeader(filename);

  let format: sdk.AudioFormatTag;
  switch (wavFileHeader.tag) {
    case 1: // PCM
      format = sdk.AudioFormatTag.PCM;
      break;
    case 6:
      format = sdk.AudioFormatTag.ALaw;
      break;
    case 7:
      format = sdk.AudioFormatTag.MuLaw;
      break;
    default:
      throw new Error(`Wave format ${wavFileHeader.tag} is not supported`);
  }

  // 创建 PCM 音频格式
  const audioFormat = sdk.AudioStreamFormat.getWaveFormat(
    wavFileHeader.framerate,
    wavFileHeader.bitsPerSample,
    wavFileHeader.nChannels,
    format
  );

  // 创建推流
  const pushStream = sdk.AudioInputStream.createPushStream(audioFormat);

  // 打开文件并推送到推流
  const readStream = fs.createReadStream(filename, { start: 44 });
  readStream.on('data', (chunk: Buffer) => {
    pushStream.write(chunk);
  });
  readStream.on('end', () => {
    pushStream.close();
  });

  return pushStream;
};

// 读取 wav 文件头
export const readWavFileHeader = (audioFileName: string): WavFileHeader => {
  const fd = fs.openSync(audioFileName, 'r');

  if (readString(fd, 4) !== 'RIFF') {
    throw new Error("Error reading .wav file header. Expected 'RIFF' tag.");
  }
  readInt32(fd); // Skip file length
  if (readString(fd, 4) !== 'WAVE') {
    throw new Error("Error reading .wav file header. Expected 'WAVE' tag.");
  }
  if (readString(fd, 4) !== 'fmt ') {
    throw new Error("Error reading .wav file header. Expected 'fmt ' tag.");
  }
  const formatSize = readInt32(fd);
  if (formatSize > 16) {
    throw new Error(`Error reading .wav file header. Expected format size 16 bytes. Actual size: ${formatSize}`);
  }
  const tag = readUInt16(fd);
  const nChannels = readUInt16(fd);
  const framerate = readUInt32(fd);
  readUInt32(fd); // Skip average bytes per second
  readUInt16(fd); // Skip block align
  const bitsPerSample = readUInt16(fd);

  fs.closeSync(fd);

  return { framerate, bitsPerSample, nChannels, tag };
};

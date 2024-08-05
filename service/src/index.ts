import express from 'express'
import type { RequestProps } from './types'
import type { ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'
import { fetchAudio, fetchToken } from './tts/azure'

import { OpenaiTTS } from './tts/openai'
import { GenerateImages } from './images'

const app = express()
const router = express.Router()

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { model,prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true
    await chatReplyProcess({
      model:model,
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})


//tts
router.post('/tts', async (req, res) => {
  try {
    const data = req.body;
    const provider = data.provider;
    let arrayBuffer = null;
    if (provider == 'Azure') {
      arrayBuffer = await fetchAudio(data.message,data.voice,data.speed);
    }else{
      arrayBuffer = await OpenaiTTS(data.message,data.voice,data.speed)
    }
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    res.send({ status: 'Success', message: null, data: base64Audio })
  } catch (error) {
    console.error('Error in audio POST handler:', error);
    res.send({ status: 'Fail', message: "Internal Server Error.", data: null })
  }
});

//images
router.post('/generate-image', async (req, res) => {
  try {
    const data = req.body;
    const prompt = data.prompt
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const imgdata = await GenerateImages(prompt,data.model,data.size,data.style);
    res.send({ status: 'Success', message: null, data: imgdata })
  } catch (error) {
    console.error('Error in images GET handler:',error);
    res.send({ status: 'Fail', message: "Failed to generate image", data: null })
  }
});

router.get('/azuretoken',async (req, res) => {
  try {
    const token = await fetchToken()
    res.send({ status: 'Success', message: null, data: token })
  } catch (error) {
    console.error('Error in token handler:',error);
    res.send({ status: 'Fail', message: "Failed to get token", data: null })
  }
})
app.use('', router)
app.use('/api', router)
app.set('trust proxy', 1)

app.listen(3002, () => globalThis.console.log('Server is running on port 3002'))


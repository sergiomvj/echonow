import axios from 'axios'

export interface VoiceOptions {
  voiceId?: string
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
}

export interface SynthesisResult {
  audioBuffer: ArrayBuffer
  audioUrl?: string
  duration: number
  success: boolean
  error?: string
}

export class VoiceSynthesizer {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'
  
  // EchoNow voice configurations
  private voices = {
    narrator: 'pNInz6obpgDQGcFmaJgB', // Professional narrator voice
    casual: '21m00Tcm4TlvDq8ikWAM', // Casual, friendly voice
    news: 'AZnzlk1XvdvUeBnXmlld', // News anchor style
    expert: 'EXAVITQu4vr4xnSDxMaL', // Expert/academic tone
    young: 'ThT5KcBeYPX3keUQqHPh'  // Younger audience
  }

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || ''
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. Voice synthesis will be disabled.')
    }
  }

  async synthesizeText(
    text: string, 
    options: VoiceOptions = {}
  ): Promise<SynthesisResult> {
    if (!this.apiKey) {
      return {
        audioBuffer: new ArrayBuffer(0),
        duration: 0,
        success: false,
        error: 'ElevenLabs API key not configured'
      }
    }

    try {
      const voiceId = options.voiceId || this.voices.narrator
      const cleanText = this.preprocessText(text)
      
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: options.stability || 0.75,
            similarity_boost: options.similarityBoost || 0.85,
            style: options.style || 0.0,
            use_speaker_boost: options.useSpeakerBoost || true
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      )

      const audioBuffer = response.data
      const duration = this.estimateAudioDuration(cleanText)

      return {
        audioBuffer,
        duration,
        success: true
      }
    } catch (error: any) {
      console.error('Voice synthesis error:', error)
      return {
        audioBuffer: new ArrayBuffer(0),
        duration: 0,
        success: false,
        error: error.response?.data?.message || error.message || 'Synthesis failed'
      }
    }
  }

  async synthesizeShortScript(script: string, voiceStyle: keyof typeof this.voices = 'narrator'): Promise<SynthesisResult> {
    // Clean script for TTS (remove timing cues, etc.)
    const cleanScript = this.cleanScriptForTTS(script)
    
    const voiceId = this.voices[voiceStyle]
    
    return this.synthesizeText(cleanScript, {
      voiceId,
      stability: 0.8,
      similarityBoost: 0.9,
      useSpeakerBoost: true
    })
  }

  async createMultivoiceContent(segments: Array<{text: string, voice: keyof typeof this.voices}>): Promise<SynthesisResult[]> {
    const syntheses = await Promise.allSettled(
      segments.map(segment => 
        this.synthesizeText(segment.text, { voiceId: this.voices[segment.voice] })
      )
    )

    return syntheses.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            audioBuffer: new ArrayBuffer(0),
            duration: 0,
            success: false,
            error: 'Synthesis failed for segment'
          }
    )
  }

  async getAvailableVoices(): Promise<any[]> {
    if (!this.apiKey) return []

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })
      
      return response.data.voices || []
    } catch (error) {
      console.error('Error fetching voices:', error)
      return []
    }
  }

  async getVoiceSettings(voiceId: string): Promise<any> {
    if (!this.apiKey) return null

    try {
      const response = await axios.get(`${this.baseUrl}/voices/${voiceId}/settings`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Error fetching voice settings:', error)
      return null
    }
  }

  // Utility methods
  private preprocessText(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      // Fix abbreviations for better pronunciation
      .replace(/\bIA\b/g, 'inteligência artificial')
      .replace(/\bEUA\b/g, 'Estados Unidos')
      .replace(/\bUE\b/g, 'União Europeia')
      .replace(/\bONU\b/g, 'Organização das Nações Unidas')
      // Add pauses for better flow
      .replace(/\. /g, '. ')
      .replace(/\? /g, '? ')
      .replace(/! /g, '! ')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim()
  }

  private cleanScriptForTTS(script: string): string {
    return script
      // Remove timing cues like [0:03]
      .replace(/\[\d+:\d+\]/g, '')
      // Remove stage directions
      .replace(/\[.*?\]/g, '')
      // Remove action cues
      .replace(/\(.*?\)/g, '')
      // Clean up
      .replace(/\s+/g, ' ')
      .trim()
  }

  private estimateAudioDuration(text: string): number {
    // Estimate based on average speaking rate
    // Portuguese: ~130-150 words per minute
    // Characters: ~1000-1200 per minute
    const charCount = text.length
    const estimatedMinutes = charCount / 1100 // Conservative estimate
    return Math.ceil(estimatedMinutes * 60) // Return seconds
  }

  // Convert audio buffer to blob for browser usage
  audioBufferToBlob(audioBuffer: ArrayBuffer, mimeType: string = 'audio/mpeg'): Blob {
    return new Blob([audioBuffer], { type: mimeType })
  }

  // Create audio URL for immediate playback
  createAudioUrl(audioBuffer: ArrayBuffer): string {
    const blob = this.audioBufferToBlob(audioBuffer)
    return URL.createObjectURL(blob)
  }

  // Save audio to file (Node.js environment)
  async saveAudioFile(audioBuffer: ArrayBuffer, filename: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined') {
        // Browser environment - trigger download
        const blob = this.audioBufferToBlob(audioBuffer)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
        return true
      } else {
        // Node.js environment
        const fs = await import('fs')
        fs.writeFileSync(filename, Buffer.from(audioBuffer))
        return true
      }
    } catch (error) {
      console.error('Error saving audio file:', error)
      return false
    }
  }

  // Check service status
  async checkServiceStatus(): Promise<{available: boolean, message: string}> {
    if (!this.apiKey) {
      return {
        available: false,
        message: 'API key not configured'
      }
    }

    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })
      
      return {
        available: true,
        message: `Service available. User: ${response.data.name || 'Unknown'}`
      }
    } catch (error: any) {
      return {
        available: false,
        message: error.response?.data?.message || 'Service unavailable'
      }
    }
  }
}

export const voiceSynthesizer = new VoiceSynthesizer()
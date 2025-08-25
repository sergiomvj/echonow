import { VoiceSynthesizer } from '../voice-synthesizer'

// Mock ElevenLabs API
jest.mock('elevenlabs', () => {
  return {
    ElevenLabsApi: jest.fn().mockImplementation(() => ({
      textToSpeech: {
        convert: jest.fn()
      },
      voices: {
        getAll: jest.fn()
      }
    }))
  }
})

describe('VoiceSynthesizer', () => {
  let voiceSynthesizer: VoiceSynthesizer
  let mockConvert: jest.Mock
  let mockGetAll: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    voiceSynthesizer = new VoiceSynthesizer()
    
    // Mock ElevenLabs responses
    mockConvert = jest.fn().mockResolvedValue({
      data: new ArrayBuffer(1024), // Mock audio data
      headers: {
        'content-type': 'audio/mpeg'
      }
    })
    
    mockGetAll = jest.fn().mockResolvedValue({
      voices: [
        {
          voice_id: 'voice1',
          name: 'Portuguese Female',
          category: 'premade',
          labels: { accent: 'brazilian', gender: 'female' }
        },
        {
          voice_id: 'voice2', 
          name: 'Portuguese Male',
          category: 'premade',
          labels: { accent: 'brazilian', gender: 'male' }
        }
      ]
    })
    
    // Set up the mocks on the instance
    ;(voiceSynthesizer as any).elevenlabs = {
      textToSpeech: {
        convert: mockConvert
      },
      voices: {
        getAll: mockGetAll
      }
    }
  })

  describe('synthesizeText', () => {
    test('synthesizes text with default voice', async () => {
      const text = 'Este é um teste de síntese de voz.'
      
      const result = await voiceSynthesizer.synthesizeText(text)

      expect(result).toEqual({
        audioBuffer: expect.any(ArrayBuffer),
        contentType: 'audio/mpeg',
        voiceId: 'default-portuguese'
      })

      expect(mockConvert).toHaveBeenCalledWith({
        voice_id: 'default-portuguese',
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    })

    test('synthesizes text with custom voice', async () => {
      const text = 'Texto customizado'
      const voiceId = 'custom-voice-id'
      
      await voiceSynthesizer.synthesizeText(text, voiceId)

      expect(mockConvert).toHaveBeenCalledWith(expect.objectContaining({
        voice_id: voiceId,
        text: text
      }))
    })

    test('handles synthesis errors gracefully', async () => {
      mockConvert.mockRejectedValueOnce(new Error('API Error'))

      const text = 'Test text'

      await expect(voiceSynthesizer.synthesizeText(text))
        .rejects.toThrow('Voice synthesis failed')
    })

    test('validates text input length', async () => {
      const longText = 'a'.repeat(6000) // Exceeds 5000 character limit

      await expect(voiceSynthesizer.synthesizeText(longText))
        .rejects.toThrow('Text too long for synthesis')
    })

    test('handles empty text input', async () => {
      await expect(voiceSynthesizer.synthesizeText(''))
        .rejects.toThrow('Text cannot be empty')
    })
  })

  describe('synthesizeShort', () => {
    test('synthesizes short script with segments', async () => {
      const script = '[0:00] Introdução ao tópico [0:15] Desenvolvimento da ideia [0:45] Conclusão'
      
      mockConvert
        .mockResolvedValueOnce({ data: new ArrayBuffer(512) })
        .mockResolvedValueOnce({ data: new ArrayBuffer(512) })
        .mockResolvedValueOnce({ data: new ArrayBuffer(512) })

      const result = await voiceSynthesizer.synthesizeShort(script)

      expect(result).toEqual({
        segments: [
          {
            timestamp: '0:00',
            text: 'Introdução ao tópico',
            audioBuffer: expect.any(ArrayBuffer)
          },
          {
            timestamp: '0:15', 
            text: 'Desenvolvimento da ideia',
            audioBuffer: expect.any(ArrayBuffer)
          },
          {
            timestamp: '0:45',
            text: 'Conclusão',
            audioBuffer: expect.any(ArrayBuffer)
          }
        ],
        totalDuration: 60,
        voiceId: 'default-portuguese'
      })

      expect(mockConvert).toHaveBeenCalledTimes(3)
    })

    test('handles malformed script format', async () => {
      const badScript = 'No timestamp format here'

      const result = await voiceSynthesizer.synthesizeShort(badScript)

      expect(result.segments).toHaveLength(1)
      expect(result.segments[0]).toEqual({
        timestamp: '0:00',
        text: badScript,
        audioBuffer: expect.any(ArrayBuffer)
      })
    })
  })

  describe('getAvailableVoices', () => {
    test('retrieves and filters Portuguese voices', async () => {
      const voices = await voiceSynthesizer.getAvailableVoices()

      expect(voices).toEqual([
        {
          id: 'voice1',
          name: 'Portuguese Female',
          gender: 'female',
          accent: 'brazilian',
          category: 'premade'
        },
        {
          id: 'voice2',
          name: 'Portuguese Male', 
          gender: 'male',
          accent: 'brazilian',
          category: 'premade'
        }
      ])

      expect(mockGetAll).toHaveBeenCalled()
    })

    test('handles API errors when fetching voices', async () => {
      mockGetAll.mockRejectedValueOnce(new Error('API Error'))

      await expect(voiceSynthesizer.getAvailableVoices())
        .rejects.toThrow('Failed to fetch available voices')
    })
  })

  describe('private methods', () => {
    test('parseShortScript correctly extracts segments', () => {
      const script = '[0:00] First segment [0:30] Second segment [1:00] Third segment'
      
      const segments = (voiceSynthesizer as any).parseShortScript(script)

      expect(segments).toEqual([
        { timestamp: '0:00', text: 'First segment' },
        { timestamp: '0:30', text: 'Second segment' },
        { timestamp: '1:00', text: 'Third segment' }
      ])
    })

    test('calculateDuration works correctly', () => {
      const duration1 = (voiceSynthesizer as any).calculateDuration('0:30')
      const duration2 = (voiceSynthesizer as any).calculateDuration('1:15')
      const duration3 = (voiceSynthesizer as any).calculateDuration('10:00')

      expect(duration1).toBe(30)
      expect(duration2).toBe(75)
      expect(duration3).toBe(600)
    })

    test('validateVoiceId works correctly', async () => {
      const validVoice = await (voiceSynthesizer as any).validateVoiceId('voice1')
      const invalidVoice = await (voiceSynthesizer as any).validateVoiceId('invalid-voice')

      expect(validVoice).toBe(true)
      expect(invalidVoice).toBe(false)
    })
  })
})
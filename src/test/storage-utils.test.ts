import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  safeGetItem, 
  safeParseJSON, 
  safeSetItem, 
  validateAndRecoverSettings,
  type Settings 
} from '../storage-utils'

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Clear console mocks
    vi.clearAllMocks()
  })

  describe('safeGetItem', () => {
    it('should return value from localStorage when it exists', () => {
      localStorage.setItem('testKey', 'testValue')
      expect(safeGetItem('testKey')).toBe('testValue')
    })

    it('should return default value when key does not exist', () => {
      expect(safeGetItem('nonExistentKey', 'default')).toBe('default')
    })

    it('should return null as default when no default provided', () => {
      expect(safeGetItem('nonExistentKey')).toBe(null)
    })

    it('should handle localStorage access errors', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage disabled')
      })

      const result = safeGetItem('testKey', 'fallback')
      expect(result).toBe('fallback')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to read from localStorage (key: testKey):',
        expect.any(Error)
      )

      // Restore original function
      localStorage.getItem = originalGetItem
    })
  })

  describe('safeParseJSON', () => {
    it('should parse valid JSON', () => {
      const testData = { name: 'test', value: 123 }
      const result = safeParseJSON(JSON.stringify(testData), {})
      expect(result).toEqual(testData)
    })

    it('should return default value for null/empty input', () => {
      expect(safeParseJSON(null, 'default')).toBe('default')
      expect(safeParseJSON('', 'default')).toBe('default')
    })

    it('should return default value for invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const result = safeParseJSON('invalid json', [])
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to parse JSON:', expect.any(Error))
    })

    it('should handle arrays correctly', () => {
      const testArray = [1, 2, 3]
      const result = safeParseJSON(JSON.stringify(testArray), [])
      expect(result).toEqual(testArray)
    })
  })

  describe('safeSetItem', () => {
    it('should set item in localStorage successfully', () => {
      const result = safeSetItem('testKey', 'testValue')
      expect(result).toBe(true)
      expect(localStorage.getItem('testKey')).toBe('testValue')
    })

    it('should handle localStorage write errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        const error = new Error('QuotaExceededError')
        error.name = 'QuotaExceededError'
        throw error
      })

      const result = safeSetItem('testKey', 'testValue')
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to write to localStorage (key: testKey):',
        expect.any(Error)
      )

      // Restore original function
      localStorage.setItem = originalSetItem
    })
  })

  describe('validateAndRecoverSettings', () => {
    it('should return valid settings unchanged', () => {
      const validSettings: Settings = {
        apiKey: 'test-key',
        locations: [
          { name: 'Test', url: 'https://workflowy.com/#/test', createDaily: false }
        ],
        history: [
          { id: '1', title: 'Test Note', location: 'Test', timestamp: '2023-01-01T00:00:00Z' }
        ],
        dailyNoteCache: { '2023-01-01': 'cached-url' }
      }

      const result = validateAndRecoverSettings(validSettings)
      expect(result.changed).toBe(false)
      expect(result.settings).toEqual(validSettings)
    })

    it('should fix invalid locations array', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const invalidSettings = {
        apiKey: 'test-key',
        locations: 'not an array' as any,
        history: [],
        dailyNoteCache: {}
      }

      const result = validateAndRecoverSettings(invalidSettings)
      expect(result.changed).toBe(true)
      expect(result.settings.locations).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Invalid locations array detected, resetting to empty array')
    })

    it('should filter out invalid location objects', () => {
      const invalidSettings: Settings = {
        apiKey: 'test-key',
        locations: [
          { name: 'Valid', url: 'https://workflowy.com/#/valid', createDaily: false },
          { name: 'Invalid', url: 'https://example.com', createDaily: false }, // Wrong domain
          { name: '', url: 'https://workflowy.com/#/empty', createDaily: false }, // Empty name
          null as any, // Null location
        ],
        history: [],
        dailyNoteCache: {}
      }

      const result = validateAndRecoverSettings(invalidSettings)
      expect(result.changed).toBe(true)
      expect(result.settings.locations).toHaveLength(1)
      expect(result.settings.locations[0].name).toBe('Valid')
    })

    it('should fix invalid history array', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const invalidSettings = {
        apiKey: 'test-key',
        locations: [],
        history: 'not an array' as any,
        dailyNoteCache: {}
      }

      const result = validateAndRecoverSettings(invalidSettings)
      expect(result.changed).toBe(true)
      expect(result.settings.history).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Invalid history array detected, resetting to empty array')
    })

    it('should fix invalid daily note cache', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const invalidSettings = {
        apiKey: 'test-key',
        locations: [],
        history: [],
        dailyNoteCache: 'not an object' as any
      }

      const result = validateAndRecoverSettings(invalidSettings)
      expect(result.changed).toBe(true)
      expect(result.settings.dailyNoteCache).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith('Invalid daily note cache detected, resetting to empty object')
    })

    it('should fix invalid API key', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      const invalidSettings = {
        apiKey: null as any,
        locations: [],
        history: [],
        dailyNoteCache: {}
      }

      const result = validateAndRecoverSettings(invalidSettings)
      expect(result.changed).toBe(true)
      expect(result.settings.apiKey).toBe('')
      expect(consoleSpy).toHaveBeenCalledWith('Invalid API key detected, resetting to empty string')
    })
  })
})
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  buildNoteWithTimestamp, 
  getTodayDateKey, 
  getCachedDailyNoteUrl,
  cacheDailyNoteUrl,
  cleanOldDailyNoteCache,
  type DailyNoteCache 
} from '../workflowy'

describe('Workflowy Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset date mocks
    vi.useRealTimers()
  })

  describe('buildNoteWithTimestamp', () => {
    it('should return note unchanged when timestamp disabled', () => {
      const note = 'Test note content'
      const result = buildNoteWithTimestamp(note, false)
      expect(result).toBe(note)
    })

    it('should return only timestamp for empty note when timestamp enabled', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const result = buildNoteWithTimestamp('', true)
      expect(result).toBe('2023-01-15 23:30') // Asia/Tokyo timezone
    })

    it('should prepend timestamp to note when timestamp enabled', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const note = 'Test note content'
      const result = buildNoteWithTimestamp(note, true)
      expect(result).toBe('2023-01-15 23:30\n\nTest note content')
    })

    it('should handle whitespace-only notes', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const result = buildNoteWithTimestamp('   \n  ', true)
      expect(result).toBe('2023-01-15 23:30')
    })
  })

  describe('getTodayDateKey', () => {
    it('should return today date in YYYY-MM-DD format', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const result = getTodayDateKey()
      expect(result).toBe('2023-01-15')
    })

    it('should handle different dates correctly', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-12-25T23:59:59Z'))
      
      const result = getTodayDateKey()
      expect(result).toBe('2023-12-25')
    })
  })

  describe('getCachedDailyNoteUrl', () => {
    it('should return cached URL for today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-15': 'https://workflowy.com/#/cached-daily-note'
      }
      
      const result = getCachedDailyNoteUrl(cache)
      expect(result).toBe('https://workflowy.com/#/cached-daily-note')
    })

    it('should return null when no cache for today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-14': 'https://workflowy.com/#/yesterday'
      }
      
      const result = getCachedDailyNoteUrl(cache)
      expect(result).toBe(null)
    })

    it('should return null for empty cache', () => {
      const result = getCachedDailyNoteUrl({})
      expect(result).toBe(null)
    })
  })

  describe('cacheDailyNoteUrl', () => {
    it('should add today URL to cache', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-14': 'https://workflowy.com/#/yesterday'
      }
      
      const result = cacheDailyNoteUrl(cache, 'https://workflowy.com/#/today')
      
      expect(result).toEqual({
        '2023-01-14': 'https://workflowy.com/#/yesterday',
        '2023-01-15': 'https://workflowy.com/#/today'
      })
    })

    it('should overwrite existing today URL', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-15': 'https://workflowy.com/#/old-today'
      }
      
      const result = cacheDailyNoteUrl(cache, 'https://workflowy.com/#/new-today')
      
      expect(result).toEqual({
        '2023-01-15': 'https://workflowy.com/#/new-today'
      })
    })
  })

  describe('cleanOldDailyNoteCache', () => {
    it('should keep recent entries within days limit', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-15': 'today',      // 0 days old - keep
        '2023-01-14': 'yesterday',  // 1 day old - keep
        '2023-01-09': 'week-old',   // 6 days old - keep
        '2023-01-08': 'too-old',    // 7 days old - keep (exactly at limit)
        '2023-01-07': 'very-old'    // 8 days old - remove
      }
      
      const result = cleanOldDailyNoteCache(cache, 7)
      
      expect(result).toEqual({
        '2023-01-15': 'today',
        '2023-01-14': 'yesterday', 
        '2023-01-09': 'week-old',
        '2023-01-08': 'too-old'
      })
    })

    it('should handle empty cache', () => {
      const result = cleanOldDailyNoteCache({})
      expect(result).toEqual({})
    })

    it('should use default 7 days when no limit specified', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2023-01-15T14:30:00Z'))
      
      const cache: DailyNoteCache = {
        '2023-01-15': 'recent',
        '2023-01-01': 'very-old'    // 14 days old - should be removed
      }
      
      const result = cleanOldDailyNoteCache(cache)
      
      expect(result).toEqual({
        '2023-01-15': 'recent'
      })
    })
  })
})
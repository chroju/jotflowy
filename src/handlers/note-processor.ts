import { createBullet, createDailyNote, buildNoteWithTimestamp, getTodayDateKey, getCachedDailyNoteUrl, WorkflowyAPIError } from '../workflowy';
import { getTitleFromUrl } from '../utils/url-utils';
import { isValidHttpUrl } from '../utils/validation-utils';
import { RequestData, ProcessNoteResult } from '../types';

export async function processNoteCreation(data: RequestData & { apiKey: string }): Promise<ProcessNoteResult> {
  try {
    let title = data.title;
    let saveLocationUrl = data.saveLocationUrl;
    const originalSaveLocationUrl = data.saveLocationUrl; // Keep original for daily note recovery

    // Handle URL title extraction if enabled
    if (data.expandUrls && isValidHttpUrl(title) && !title.includes('x.com')) {
      try {
        const extractedTitle = await getTitleFromUrl(title);
        if (extractedTitle) {
          // Format as Markdown link: [title](url)
          title = `[${extractedTitle}](${title})`;
        }
      } catch (error) {
        console.warn('Failed to extract title from URL:', error);
      }
    }

    // Build note content with optional timestamp
    const noteContent = buildNoteWithTimestamp(data.note, data.includeTimestamp);
    let dailyNoteUrl: string | undefined;

    // Handle daily note creation if needed
    if (data.createDaily) {
      try {
        // Check if we already have today's daily note cached
        const cachedUrl = getCachedDailyNoteUrl(data.dailyNoteCache || {});
        
        if (cachedUrl) {
          // Try to use cached daily note URL first
          saveLocationUrl = cachedUrl;
          dailyNoteUrl = cachedUrl;
          console.log('Using cached daily note for today');
        } else {
          // Create new daily note and cache the URL
          const dailyNote = await createDailyNote(data.apiKey, data.saveLocationUrl);
          saveLocationUrl = dailyNote.new_bullet_url;
          dailyNoteUrl = dailyNote.new_bullet_url;
          console.log('Created new daily note with ID:', dailyNote.new_bullet_id);
        }
      } catch (error) {
        console.error('Failed to create daily note:', error);
        
        // Check if this is a location-not-found error
        if (error instanceof WorkflowyAPIError && 
            (error.message.includes('location') || error.message.includes('not found') || error.status === 404)) {
          throw new WorkflowyAPIError(
            `Could not create daily note (${getTodayDateKey()}) at the specified location. Please check that your daily note location exists in Workflowy and try again.`,
            error.status
          );
        }
        
        // For other daily note creation errors, continue with original location
        console.warn('Daily note creation failed, using original location instead');
      }
    }

    // Create the main bullet
    try {
      const result = await createBullet({
        apiKey: data.apiKey,
        title,
        note: noteContent,
        saveLocationUrl,
      });

      console.log('Successfully created bullet with ID:', result.new_bullet_id);

      return { 
        dailyNoteUrl,
        new_bullet_url: result.new_bullet_url 
      };
    } catch (error) {
      
      // If using daily note and getting location-related error, try to recover
      if (data.createDaily && error instanceof WorkflowyAPIError && 
          error.message.toLowerCase().includes('location')) {
        
        console.warn('Daily note appears to have been deleted, attempting to create new one');
        
        try {
          // Create new daily note and retry
          const parentUrl = data.dailyNoteParentUrl || originalSaveLocationUrl;
          const newDailyNote = await createDailyNote(data.apiKey, parentUrl);
          const retryResult = await createBullet({
            apiKey: data.apiKey,
            title,
            note: noteContent,
            saveLocationUrl: newDailyNote.new_bullet_url,
          });
          
          console.log('Successfully created bullet in new daily note with ID:', retryResult.new_bullet_id);
          
          return { 
            dailyNoteUrl: newDailyNote.new_bullet_url,
            new_bullet_url: retryResult.new_bullet_url 
          };
        } catch (retryError) {
          throw new WorkflowyAPIError(
            `Daily note (${getTodayDateKey()}) was not found and could not be recreated. Please check that your daily note location exists in Workflowy and try again.`,
            retryError instanceof WorkflowyAPIError ? retryError.status : 500
          );
        }
      }
      
      // Re-throw original error if not a daily note issue
      throw error;
    }
  } catch (error) {
    console.error('Error processing note creation:', error);
    
    if (error instanceof WorkflowyAPIError) {
      console.error('Workflowy API Error:', error.message, error.status);
    }
    
    // Re-throw the error so it can be caught by handleSend
    throw error;
  }
}
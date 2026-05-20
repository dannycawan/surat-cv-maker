// src/utils/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key prefixes for different types of documents
const JOB_APPLICATION_KEY = '@SuratCVMaker:jobApplication:';
const CV_KEY = '@SuratCVMaker:cv:';
const RESIGNATION_KEY = '@SuratCVMaker:resignation:';

// Interface for draft items
export interface DraftItem {
  id: string;
  documentType: 'jobApplication' | 'cv' | 'resignation';
  title: string;
  data: any;
  timestamp: number;
}

// Get appropriate storage key based on document type
const getKeyPrefix = (documentType: string): string => {
  switch (documentType) {
    case 'jobApplication':
      return JOB_APPLICATION_KEY;
    case 'cv':
      return CV_KEY;
    case 'resignation':
      return RESIGNATION_KEY;
    default:
      return '@SuratCVMaker:';
  }
};

// Save a draft
export const saveDraft = async (
  documentType: 'jobApplication' | 'cv' | 'resignation',
  data: any,
  title: string,
  existingDraftId?: string
): Promise<string> => {
  try {
    // Use existing ID or create a new one
    const draftId = existingDraftId || `${Date.now()}`;
    const keyPrefix = getKeyPrefix(documentType);
    const draftItem: DraftItem = {
      id: draftId,
      documentType,
      title,
      data,
      timestamp: Date.now(),
    };
    
    // Save the draft
    await AsyncStorage.setItem(`${keyPrefix}${draftId}`, JSON.stringify(draftItem));
    
    // Update the list of drafts
    let draftList = await getDraftList(documentType);
    
    if (existingDraftId) {
      // If updating an existing draft, replace it in the list
      draftList = draftList.map(draft => 
        draft.id === existingDraftId ? draftItem : draft
      );
    } else {
      // If new draft, add to the list
      draftList.push(draftItem);
    }
    
    // Save the updated list
    await AsyncStorage.setItem(`${keyPrefix}list`, JSON.stringify(draftList));
    
    return draftId;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

// Get a draft by ID
export const getDraft = async (documentType: string, draftId: string): Promise<DraftItem | null> => {
  try {
    const keyPrefix = getKeyPrefix(documentType);
    const draftJson = await AsyncStorage.getItem(`${keyPrefix}${draftId}`);
    
    if (draftJson) {
      return JSON.parse(draftJson) as DraftItem;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
};

// Get list of drafts by document type
export const getDraftList = async (documentType: string): Promise<DraftItem[]> => {
  try {
    const keyPrefix = getKeyPrefix(documentType);
    const listJson = await AsyncStorage.getItem(`${keyPrefix}list`);
    
    if (listJson) {
      return JSON.parse(listJson) as DraftItem[];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting draft list:', error);
    return [];
  }
};

// Delete a draft
export const deleteDraft = async (documentType: string, draftId: string): Promise<boolean> => {
  try {
    const keyPrefix = getKeyPrefix(documentType);
    
    // Remove the draft
    await AsyncStorage.removeItem(`${keyPrefix}${draftId}`);
    
    // Update the list
    const draftList = await getDraftList(documentType);
    const updatedList = draftList.filter(draft => draft.id !== draftId);
    await AsyncStorage.setItem(`${keyPrefix}list`, JSON.stringify(updatedList));
    
    return true;
  } catch (error) {
    console.error('Error deleting draft:', error);
    return false;
  }
};

// Get all drafts (for all document types)
export const getAllDrafts = async (): Promise<DraftItem[]> => {
  try {
    const jobApplicationDrafts = await getDraftList('jobApplication');
    const cvDrafts = await getDraftList('cv');
    const resignationDrafts = await getDraftList('resignation');
    
    return [...jobApplicationDrafts, ...cvDrafts, ...resignationDrafts].sort(
      (a, b) => b.timestamp - a.timestamp
    );
  } catch (error) {
    console.error('Error getting all drafts:', error);
    return [];
  }
};
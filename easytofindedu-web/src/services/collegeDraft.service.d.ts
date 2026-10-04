import * as api from './api';

declare module './api' {
  // Allow the collegeDraft.service.js plain functions to be imported from TS.
}

declare module './collegeDraft.service' {
  export const getDraft: () => Promise<any>;
  export const saveDraft: (payload: any) => Promise<any>;
  export const getDraftStatus: () => Promise<any>;
  export const submitDraft: () => Promise<any>;
  export const deleteDraft: () => Promise<any>;
  export const uploadCollegeDraftFile: (
    file: File,
    opts: {
      stepNumber: number;
      fieldName: string;
      append?: boolean;
      arrayField?: string;
    }
  ) => Promise<any>;
}
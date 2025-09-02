import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface ResumeData {
  name: string;
  size: number;
  uri: string;
  pageCount: number;
  extractedText?: string;
  pdfJsonData?: any; // JSON data from pdf2json
  uploadDate: string;
}

export interface ResumeState {
  currentResume: ResumeData | null;
  isProcessing: boolean;
}

const initialState: ResumeState = {
  currentResume: null,
  isProcessing: false,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setResumeData: (state, action: PayloadAction<ResumeData>) => {
      state.currentResume = action.payload;
    },
    setExtractedText: (state, action: PayloadAction<string>) => {
      if (state.currentResume) {
        state.currentResume.extractedText = action.payload;
      }
    },
    setPdfJsonData: (state, action: PayloadAction<any>) => {
      if (state.currentResume) {
        state.currentResume.pdfJsonData = action.payload;
      }
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    clearResume: (state) => {
      state.currentResume = null;
      state.isProcessing = false;
    },
  },
});

export const { setResumeData, setExtractedText, setPdfJsonData, setProcessing, clearResume } = resumeSlice.actions;
export default resumeSlice.reducer;

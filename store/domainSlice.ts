import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface DomainData {
  field: string;
  skills: Skill[];
  programmingLanguages: string[];
  experience: string;
  completedAt: string;
}

export interface DomainState {
  currentDomain: DomainData | null;
  isCompleted: boolean;
}

const initialState: DomainState = {
  currentDomain: null,
  isCompleted: false,
};

const domainSlice = createSlice({
  name: "domain",
  initialState,
  reducers: {
    setField: (state, action: PayloadAction<string>) => {
      if (!state.currentDomain) {
        state.currentDomain = {
          field: action.payload,
          skills: [],
          programmingLanguages: [],
          experience: "",
          completedAt: "",
        };
      } else {
        state.currentDomain.field = action.payload;
      }
    },
    setSkills: (state, action: PayloadAction<Skill[]>) => {
      if (state.currentDomain) {
        state.currentDomain.skills = action.payload;
      }
    },
    setProgrammingLanguages: (state, action: PayloadAction<string[]>) => {
      if (state.currentDomain) {
        state.currentDomain.programmingLanguages = action.payload;
      }
    },
    setExperience: (state, action: PayloadAction<string>) => {
      if (state.currentDomain) {
        state.currentDomain.experience = action.payload;
      }
    },
    completeDomainSelection: (state) => {
      if (state.currentDomain) {
        state.currentDomain.completedAt = new Date().toISOString();
        state.isCompleted = true;
      }
    },
    clearDomainData: (state) => {
      state.currentDomain = null;
      state.isCompleted = false;
    },
    resetDomainSelection: (state) => {
      if (state.currentDomain) {
        state.currentDomain.skills = [];
        state.currentDomain.programmingLanguages = [];
        state.currentDomain.experience = '';
        state.currentDomain.completedAt = '';
        state.isCompleted = false;
      }
    },
  },
});

export const {
  setField,
  setSkills,
  setProgrammingLanguages,
  setExperience,
  completeDomainSelection,
  clearDomainData,
  resetDomainSelection,
} = domainSlice.actions;

export default domainSlice.reducer;

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { StoredAuthData } from "./authPersistence";

export interface AuthUserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string | null;
}

export interface AuthState {
  user: AuthUserState | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUserState>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    initializeFromStorage: (state, action: PayloadAction<StoredAuthData>) => {
      state.user = {
        uid: action.payload.uid,
        email: action.payload.email,
        displayName: action.payload.displayName,
        photoURL: action.payload.photoURL,
        phoneNumber: action.payload.phoneNumber,
        providerId: action.payload.providerId,
      };
      state.isAuthenticated = true;
    },
  },
});

export const { setUser, clearUser, initializeFromStorage } = authSlice.actions;
export default authSlice.reducer;


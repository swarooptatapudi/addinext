import { USER } from '@/uttils/Types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: { user: USER | null } = {
  user: null
};

export const authSlice = createSlice({
  name: 'authReducer',
  reducerPath: 'loginReducer',
  initialState,
  reducers: {
    updateUser: (state, action: PayloadAction<USER>) => {
      state.user = action.payload;
    }
  }
});

export const { updateUser } = authSlice.actions;

export default authSlice.reducer;

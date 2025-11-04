import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCustomerProfile = createAsyncThunk("customer/fetchProfile", async () => {
  // data giả lập
  return {
    name: "Nguyễn Văn A",
    email: "vana@example.com",
    phone: "0901234567",
    dob: "1999-10-15",
    gender: "Nam",
    avatar: "https://i.pravatar.cc/150?img=3",
    createdAt: "2023-04-10",
  };
});

const customerSlice = createSlice({
  name: "customer",
  initialState: { profile: null, loading: false },
  reducers: {
    updateCustomerProfile: (state, action) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCustomerProfile.rejected, (state) => {
        state.loading = false;
        state.profile = null;
      });
  },
});

export const { updateCustomerProfile } = customerSlice.actions;
export default customerSlice.reducer;

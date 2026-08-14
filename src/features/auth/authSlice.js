import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

const userFromStorage = localStorage.getItem('user')

const initialState = {
  user: userFromStorage ? JSON.parse(userFromStorage) : null,
  loading: false,
  error: null,
}

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      toast.success('Logged out successfully')
    },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null }
    const handleRejected = (state, action) => {
      state.loading = false
      state.error = action.payload
      toast.error(action.payload)
    }

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('user', JSON.stringify(action.payload))
        toast.success('Welcome to ShopNest!')
      })
      .addCase(registerUser.rejected, handleRejected)

      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        localStorage.setItem('accessToken', action.payload.accessToken)
        localStorage.setItem('user', JSON.stringify(action.payload))
        toast.success('Welcome back!')
      })
      .addCase(loginUser.rejected, handleRejected)
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer

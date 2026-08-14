import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'
import toast from 'react-hot-toast'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cart')
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart/add', { productId, quantity })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add to cart')
    }
  }
)

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ cartItemId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/cart/${cartItemId}`, { quantity })
      return { cartItemId, quantity, data: res.data.data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (cartItemId, { rejectWithValue }) => {
    try {
      await api.delete(`/cart/${cartItemId}`)
      return cartItemId
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/cart')
    return []
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload || []
        state.loading = false
      })
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.rejected, (state) => { state.loading = false })

      .addCase(addToCart.fulfilled, (state, action) => {
        const existing = state.items.find(i => i.id === action.payload.id)
        if (existing) {
          existing.quantity = action.payload.quantity
        } else {
          state.items.push(action.payload)
        }
        toast.success('Added to cart!')
      })
      .addCase(addToCart.rejected, (_, action) => {
        toast.error(action.payload || 'Could not add to cart')
      })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { cartItemId, quantity } = action.payload
        const item = state.items.find(i => i.id === cartItemId)
        if (item) item.quantity = quantity
        if (quantity === 0) state.items = state.items.filter(i => i.id !== cartItemId)
      })

      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload)
        toast.success('Item removed')
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
      })
  },
})

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => {
    const price = item.product?.discountPrice ?? item.product?.price ?? 0
    return sum + price * item.quantity
  }, 0)

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export default cartSlice.reducer

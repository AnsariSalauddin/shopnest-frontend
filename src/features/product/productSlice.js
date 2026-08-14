import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axiosInstance'

export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async ({ page = 0, size = 12, sortBy = 'createdAt' } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/products', { params: { page, size, sortBy } })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const searchProducts = createAsyncThunk(
  'product/search',
  async (params, { rejectWithValue }) => {
    try {
      // Sirf non-empty params bhejo
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      )
      const res = await api.get('/products/search', { params: cleanParams })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/products/${id}`)
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/products/categories')
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    selectedProduct: null,
    categories: [],
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearSelectedProduct: (state) => { state.selectedProduct = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.content
        state.totalPages = action.payload.totalPages
        state.totalElements = action.payload.totalElements
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload
      })

      .addCase(searchProducts.pending, (state) => { state.loading = true })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.content
        state.totalPages = action.payload.totalPages
      })
      .addCase(searchProducts.rejected, (state) => { state.loading = false })

      .addCase(fetchProductById.pending, (state) => { state.loading = true })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.selectedProduct = action.payload
      })
      .addCase(fetchProductById.rejected, (state) => { state.loading = false })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
  },
})

export const { clearSelectedProduct } = productSlice.actions
export default productSlice.reducer

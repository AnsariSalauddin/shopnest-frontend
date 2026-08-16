// import axios from 'axios'
// import toast from 'react-hot-toast'

// const instance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// })

// const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
//   timeout: 15000,
// })

// // Attach JWT token to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// // Global response error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message = error.response?.data?.message || 'Something went wrong'

//     if (error.response?.status === 401) {
//       localStorage.removeItem('accessToken')
//       localStorage.removeItem('user')
//       window.location.href = '/login'
//     } else if (error.response?.status === 403) {
//       toast.error('You do not have permission to do this')
//     } else if (error.response?.status >= 500) {
//       toast.error('Server error. Please try again.')
//     }

//     return Promise.reject(error)
//   }
// )

// export default api

import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})
console.log(import.meta.env.VITE_API_URL)

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'

    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to do this')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(error)
  }
)

export default api
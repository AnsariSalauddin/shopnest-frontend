import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '../../api/axiosInstance'
import { LoadingSpinner } from '../../components/UI'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchProducts = (p = 0) => {
    setLoading(true)
    api.get(`/products?page=${p}&size=10`)
      .then(r => {
        setProducts(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts(page) }, [page])

  const openCreate = () => { setEditProduct(null); reset({}); setShowModal(true) }
  const openEdit = (p) => {
    setEditProduct(p)
    reset({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice, stock: p.stock, category: p.category, brand: p.brand })
    setShowModal(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const formData = new FormData()
      const productBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      formData.append('product', productBlob)

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product updated!')
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Product created!')
      }
      setShowModal(false)
      fetchProducts(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted')
      fetchProducts(page)
    } catch { toast.error('Delete failed') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button onClick={openCreate} className="btn-primary">+ Add Product</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 max-w-xs truncate">{product.name}</p>
                            {product.brand && <p className="text-xs text-gray-400">{product.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-gray-100 text-gray-700 text-xs px-2.5 py-1">{product.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">₹{product.discountPrice?.toLocaleString() || product.price?.toLocaleString()}</p>
                          {product.discountPrice && <p className="text-xs text-gray-400 line-through">₹{product.price?.toLocaleString()}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : 'text-green-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-amber-500">
                          ★ <span className="text-gray-700">{product.rating?.toFixed(1)} ({product.reviewCount})</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(product)}
                            className="text-xs btn-secondary py-1.5 px-3">Edit</button>
                          <button onClick={() => handleDelete(product.id)}
                            className="text-xs btn-danger py-1.5 px-3">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <span className="px-4 py-2 text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { name: 'name', label: 'Product Name', required: true },
                { name: 'category', label: 'Category', required: true },
                { name: 'brand', label: 'Brand' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input {...register(f.name, f.required ? { required: `${f.label} is required` } : {})} className="input-field" />
                  {errors[f.name] && <p className="text-xs text-red-500 mt-1">{errors[f.name].message}</p>}
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea {...register('description')} rows={3} className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                  <input {...register('price', { required: 'Required', min: { value: 0, message: '≥ 0' } })} type="number" step="0.01" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount (₹)</label>
                  <input {...register('discountPrice')} type="number" step="0.01" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                  <input {...register('stock', { required: 'Required', min: { value: 0, message: '≥ 0' } })} type="number" className="input-field" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">
                  {saving ? 'Saving...' : editProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

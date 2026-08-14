import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById } from '../features/product/productSlice'
import { addToCart } from '../features/cart/cartSlice'
import { LoadingSpinner } from '../components/UI'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedProduct: product, loading } = useSelector((s) => s.product)
  const { user } = useSelector((s) => s.auth)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchProductById(id))
    api.get(`/reviews/${id}`).then(r => setReviews(r.data.data || [])).catch(() => {})
  }, [id, dispatch])

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return }
    dispatch(addToCart({ productId: product.id, quantity }))
  }

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return }
    dispatch(addToCart({ productId: product.id, quantity }))
    navigate('/cart')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    try {
      const res = await api.post('/reviews', { productId: id, ...reviewForm })
      setReviews(prev => [res.data.data, ...prev])
      setReviewForm({ rating: 5, comment: '' })
      toast.success('Review submitted!')
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !product) return <LoadingSpinner size="lg" />

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            {product.images?.[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wide mb-1">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            {product.brand && <p className="text-sm text-gray-500 mt-1">by <span className="font-medium">{product.brand}</span></p>}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex text-amber-400">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className={`w-5 h-5 ${i <= Math.round(product.rating) ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-500">{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-4xl font-bold text-gray-900">₹{product.discountPrice.toLocaleString()}</span>
                <span className="text-xl text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                <span className="badge bg-green-100 text-green-700 text-sm">{discountPercent}% off</span>
              </>
            ) : (
              <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 10 ? '✓ In Stock' : product.stock > 0 ? `⚠ Only ${product.stock} left` : '✗ Out of Stock'}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">−</button>
                <span className="px-5 py-2 font-medium border-x border-gray-200">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">+</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-secondary flex-1 py-3 disabled:opacity-50">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0}
              className="btn-primary flex-1 py-3 disabled:opacity-50">
              Buy Now
            </button>
          </div>

          {/* Delivery badge */}
          <div className="flex gap-4 pt-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
              </svg>
              Free delivery above ₹999
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              7-day easy returns
            </span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review form */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        className={`text-2xl ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-200'} hover:text-amber-400 transition-colors`}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={4}
                    required
                    placeholder="Share your experience..."
                    className="input-field resize-none"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500">
                <a href="/login" className="text-primary-500 font-medium">Sign in</a> to write a review.
              </p>
            )}
          </div>

          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No reviews yet. Be the first!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <div className="flex text-amber-400 mt-0.5">
                        {[1,2,3,4,5].map(i => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-current' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

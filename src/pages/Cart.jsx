import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { updateCartItem, removeFromCart, selectCartTotal } from '../features/cart/cartSlice'
import { EmptyState } from '../components/UI'

export default function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items } = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)

  const handleQty = (id, qty) => {
    if (qty < 1) { dispatch(removeFromCart(id)); return }
    dispatch(updateCartItem({ cartItemId: id, quantity: qty }))
  }

  if (items.length === 0) return (
    <EmptyState
      icon={<svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h12M7 13L5.4 5M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" /></svg>}
      title="Your cart is empty"
      message="Looks like you haven't added anything yet."
      action={<Link to="/products" className="btn-primary">Start Shopping</Link>}
    />
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <Link to={`/products/${item.product?.id}`} className="shrink-0">
                <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?.id}`}>
                  <p className="font-medium text-gray-800 text-sm truncate hover:text-primary-500">{item.product?.name}</p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">{item.product?.category}</p>
                <p className="font-bold text-gray-900 mt-1">
                  ₹{(item.product?.discountPrice ?? item.product?.price ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0">
                <button onClick={() => dispatch(removeFromCart(item.id))}
                  className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => handleQty(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm">−</button>
                  <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                  <button onClick={() => handleQty(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-gray-600 hover:bg-gray-50 text-sm">+</button>
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  ₹{((item.product?.discountPrice ?? item.product?.price ?? 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-gray-800 mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={total >= 999 ? 'text-green-600 font-medium' : ''}>
                  {total >= 999 ? 'FREE' : '₹99'}
                </span>
              </div>
              {total < 999 && (
                <p className="text-xs text-primary-500">Add ₹{(999 - total).toFixed(0)} more for free delivery!</p>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>₹{(total + (total >= 999 ? 0 : 99)).toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3 mt-5">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-primary-500 hover:underline mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

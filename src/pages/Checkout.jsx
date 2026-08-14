import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { selectCartTotal } from '../features/cart/cartSlice'
import { fetchCart } from '../features/cart/cartSlice'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const grandTotal = total + (total >= 999 ? 0 : 99)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const orderPayload = {
        ...data,
        paymentMethod,
        paymentId: paymentMethod === 'COD' ? null : 'DEMO_PAY_' + Date.now(),
      }
      const res = await api.post('/orders/checkout', orderPayload)
      const order = res.data.data
      dispatch(fetchCart())
      toast.success('Order placed successfully!')
      navigate(`/orders/${order.orderNumber}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  const Field = ({ label, name, rules, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input {...register(name, rules)} type={type} placeholder={placeholder} className="input-field" />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-5">Shipping Address</h2>
              <div className="space-y-4">
                <Field label="Full Address" name="shippingAddress" placeholder="House no, Street, Area"
                  rules={{ required: 'Address is required' }} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" name="shippingCity" placeholder="Mumbai"
                    rules={{ required: 'City is required' }} />
                  <Field label="State" name="shippingState" placeholder="Maharashtra"
                    rules={{ required: 'State is required' }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Pincode" name="shippingPincode" placeholder="400001"
                    rules={{ required: 'Pincode is required', pattern: { value: /^\d{6}$/, message: '6-digit pincode' } }} />
                  <Field label="Phone" name="shippingPhone" placeholder="+91 9876543210"
                    rules={{ required: 'Phone is required' }} />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-800 mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { value: 'ONLINE', label: 'Online Payment', desc: 'UPI / Net Banking / Card (Demo)', icon: '💳' },
                ].map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="payment" value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="text-primary-500" />
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <p className="font-medium text-sm text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="font-semibold text-gray-800 mb-5">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-400">× {item.quantity}</p>
                    </div>
                    <p className="text-xs font-medium shrink-0">
                      ₹{((item.product?.discountPrice ?? item.product?.price ?? 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={total >= 999 ? 'text-green-600 font-medium' : ''}>{total >= 999 ? 'FREE' : '₹99'}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-5">
                {loading ? 'Placing Order...' : `Place Order — ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axiosInstance'
import { LoadingSpinner } from '../components/UI'

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default function OrderDetail() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${orderNumber}`)
      .then(r => setOrder(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderNumber])

  if (loading) return <LoadingSpinner size="lg" />
  if (!order) return <p className="text-center py-20 text-gray-400">Order not found.</p>

  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <Link to="/orders" className="text-sm text-primary-500 hover:underline mb-1 block">← My Orders</Link>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <span className={`badge px-4 py-2 text-sm font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
          {order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {!['CANCELLED', 'REFUNDED'].includes(order.status) && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 -z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-primary-500 transition-all"
              style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1))) * 100}%` }}
            />
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < currentStep ? 'bg-primary-500 border-primary-500 text-white' :
                  i === currentStep ? 'bg-white border-primary-500 text-primary-500' :
                  'bg-white border-gray-200 text-gray-300'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-xs text-center hidden sm:block ${i <= currentStep ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                  {step.charAt(0) + step.slice(1).toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Items */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.orderItems?.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0">
                  {item.product?.images?.[0] && (
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link to={`/products/${item.product?.id}`} className="font-medium text-sm text-gray-800 hover:text-primary-500">
                    {item.product?.name}
                  </Link>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-800 text-sm shrink-0">
                  ₹{(item.priceAtOrder * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>₹{order.totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Shipping + Payment */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {order.shippingAddress}<br />
              {order.shippingCity}, {order.shippingState} — {order.shippingPincode}<br />
              📞 {order.shippingPhone}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Payment Info</h2>
            <p className="text-sm text-gray-600">Method: <span className="font-medium">{order.paymentMethod}</span></p>
            <p className="text-sm text-gray-600 mt-1">
              Status:{' '}
              <span className={`font-medium ${order.paymentSuccess ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.paymentSuccess ? 'Paid' : 'Pending'}
              </span>
            </p>
            {order.paymentId && <p className="text-xs text-gray-400 mt-1 font-mono">{order.paymentId}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

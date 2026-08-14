import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axiosInstance'
import { LoadingSpinner, EmptyState } from '../components/UI'

const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my-orders')
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner size="lg" />

  if (orders.length === 0) return (
    <EmptyState
      icon={<svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
      title="No orders yet"
      message="Once you place an order, it will appear here."
      action={<Link to="/products" className="btn-primary">Shop Now</Link>}
    />
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link key={order.id} to={`/orders/${order.orderNumber}`}
            className="card p-5 block hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge px-3 py-1 text-xs font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{order.orderItems?.length || 0} items</p>
                </div>
              </div>
            </div>

            {order.orderItems?.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-hidden">
                {order.orderItems.slice(0, 4).map(item => (
                  <div key={item.id} className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
                {order.orderItems.length > 4 && (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium shrink-0">
                    +{order.orderItems.length - 4}
                  </div>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

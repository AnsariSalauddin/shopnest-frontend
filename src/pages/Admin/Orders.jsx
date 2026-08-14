import { useEffect, useState } from 'react'
import api from '../../api/axiosInstance'
import { LoadingSpinner } from '../../components/UI'
import toast from 'react-hot-toast'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const statusColor = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)

  const fetchOrders = (p = 0) => {
    setLoading(true)
    api.get(`/admin/orders?page=${p}&size=10`)
      .then(r => {
        setOrders(r.data.data?.content || [])
        setTotalPages(r.data.data?.totalPages || 1)
      })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders(page) }, [page])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status?status=${newStatus}`)
      toast.success('Order status updated!')
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    } catch { toast.error('Failed to update status') }
  }

  const filtered = filterStatus ? orders.filter(o => o.status === filterStatus) : orders

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Order', 'Customer', 'Date', 'Amount', 'Payment', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => (
                    <>
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="font-medium text-primary-500 hover:underline">
                            #{order.orderNumber}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {order.user?.firstName} {order.user?.lastName}
                          <div className="text-xs text-gray-400">{order.user?.email}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₹{order.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge text-xs px-2 py-1 ${order.paymentSuccess ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {order.paymentSuccess ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge px-2.5 py-1 text-xs ${statusColor[order.status] || ''}`}>{order.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>

                      {/* Expanded row — order items */}
                      {expandedOrder === order.id && (
                        <tr>
                          <td colSpan={7} className="bg-gray-50 px-8 py-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
                            <div className="flex flex-wrap gap-3">
                              {order.orderItems?.map(item => (
                                <div key={item.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
                                  <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden">
                                    {item.product?.images?.[0] && <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-gray-700 max-w-32 truncate">{item.product?.name}</p>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.priceAtOrder}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex gap-6 text-xs text-gray-500">
                              <span>📍 {order.shippingAddress}, {order.shippingCity}, {order.shippingState} — {order.shippingPincode}</span>
                              <span>📞 {order.shippingPhone}</span>
                              <span>💳 {order.paymentMethod}</span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-12 text-gray-400 text-sm">No orders found</p>
            )}
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
    </div>
  )
}

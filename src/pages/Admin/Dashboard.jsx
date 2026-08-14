import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '../../api/axiosInstance'
import { LoadingSpinner } from '../../components/UI'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/orders?size=5'),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.data)
      setRecentOrders(ordersRes.data.data?.content || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner size="lg" />

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-green-50 text-green-700' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: '🛍️', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-amber-50 text-amber-700' },
  ]

  // Demo chart data
  const revenueData = [
    { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 62000 },
    { month: 'Mar', revenue: 58000 }, { month: 'Apr', revenue: 71000 },
    { month: 'May', revenue: 89000 }, { month: 'Jun', revenue: 95000 },
  ]

  const categoryData = [
    { name: 'Electronics', orders: 120 }, { name: 'Clothing', orders: 85 },
    { name: 'Books', orders: 60 }, { name: 'Home', orders: 45 }, { name: 'Sports', orders: 30 },
  ]

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, here's what's happening</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/products" className="btn-primary text-sm py-2 px-4">+ Add Product</Link>
          <Link to="/admin/orders" className="btn-secondary text-sm py-2 px-4">Manage Orders</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`badge px-2.5 py-1 text-xs ${card.color}`}>Live</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 lg:col-span-2">
          <h2 className="font-semibold text-gray-800 mb-5">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-5">Orders by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={65} />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-500 hover:underline">View all →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-gray-500 font-medium">Order</th>
                  <th className="pb-3 text-gray-500 font-medium">Customer</th>
                  <th className="pb-3 text-gray-500 font-medium">Date</th>
                  <th className="pb-3 text-gray-500 font-medium">Amount</th>
                  <th className="pb-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-primary-500">#{order.orderNumber}</td>
                    <td className="py-3 text-gray-700">{order.user?.firstName} {order.user?.lastName}</td>
                    <td className="py-3 text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">₹{order.totalAmount?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`badge px-2.5 py-1 text-xs ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

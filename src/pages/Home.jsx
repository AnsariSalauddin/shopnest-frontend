import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../features/product/productSlice'
import ProductCard from '../components/ProductCard'
import { LoadingSpinner } from '../components/UI'
import api from '../api/axiosInstance'

export default function Home() {
  const dispatch = useDispatch()
  const { products, loading, categories } = useSelector((s) => s.product)
  const [newArrivals, setNewArrivals] = useState([])
  const [topRated, setTopRated] = useState([])

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 8 }))
    api.get('/products/new-arrivals').then(r => setNewArrivals(r.data.data)).catch(() => {})
    api.get('/products/top-rated').then(r => setTopRated(r.data.data)).catch(() => {})
  }, [dispatch])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-emerald-50 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="inline-block badge bg-primary-100 text-primary-700 mb-4 text-sm px-3 py-1">
            New Season — Up to 50% Off
          </span>
          <h1 className="text-5xl font-bold text-gray-900 mb-5 leading-tight">
            Shop Smart,<br />
            <span className="text-primary-500">Live Better</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
            Discover thousands of products across every category, with fast delivery and hassle-free returns.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/products" className="btn-primary text-base px-8 py-3">
              Shop Now
            </Link>
            <Link to="/products?category=Electronics" className="btn-secondary text-base px-8 py-3">
              Explore Electronics
            </Link>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      {categories.length > 0 && (
        <section className="bg-white border-y border-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-4 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <Link to="/products" className="shrink-0 badge bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors px-4 py-2 text-sm">
              All
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="shrink-0 badge bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors px-4 py-2 text-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
                <p className="text-sm text-gray-400 mt-0.5">Just landed this week</p>
              </div>
              <Link to="/products?sortBy=createdAt" className="text-sm text-primary-500 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* Top Rated */}
        {topRated.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Top Rated</h2>
                <p className="text-sm text-gray-400 mt-0.5">Loved by our customers</p>
              </div>
              <Link to="/products?sortBy=rating" className="text-sm text-primary-500 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {topRated.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* All Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            <Link to="/products" className="text-sm text-primary-500 hover:underline font-medium">See more →</Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        {/* Banner */}
        <section className="rounded-3xl bg-gradient-to-r from-primary-500 to-emerald-600 p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Free Delivery on Orders Over ₹999</h2>
          <p className="text-primary-100 mb-6">Use code <span className="font-bold bg-white/20 px-2 py-0.5 rounded">SHOPNEST</span> at checkout</p>
          <Link to="/products" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-colors">
            Start Shopping
          </Link>
        </section>
      </div>
    </div>
  )
}

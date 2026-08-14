import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { searchProducts } from '../features/product/productSlice'
import ProductCard from '../components/ProductCard'
import { LoadingSpinner, EmptyState } from '../components/UI'

export default function ProductList() {
  const dispatch = useDispatch()
  const { products, loading, totalPages, categories } = useSelector((s) => s.product)
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)

  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [localFilters, setLocalFilters] = useState({ minPrice, maxPrice })

  useEffect(() => {
    dispatch(searchProducts({ keyword, category, sortBy, minPrice, maxPrice, page, size: 12 }))
  }, [keyword, category, sortBy, minPrice, maxPrice, page, dispatch])

  const updateParam = (key, value) => {
    setPage(0)
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const applyPriceFilter = () => {
    updateParam('minPrice', localFilters.minPrice)
    updateParam('maxPrice', localFilters.maxPrice)
  }

  const clearFilters = () => {
    setLocalFilters({ minPrice: '', maxPrice: '' })
    setSearchParams({})
    setPage(0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="card p-5 space-y-6 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-primary-500 hover:underline">Clear all</button>
            </div>

            {/* Category */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="category" checked={!category}
                    onChange={() => updateParam('category', '')} className="text-primary-500" />
                  <span className={!category ? 'font-medium text-primary-600' : 'text-gray-600'}>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="category" checked={category === cat}
                      onChange={() => updateParam('category', cat)} className="text-primary-500" />
                    <span className={category === cat ? 'font-medium text-primary-600' : 'text-gray-600'}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Price Range (₹)</p>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={e => setLocalFilters(f => ({ ...f, minPrice: e.target.value }))}
                  className="input-field text-sm py-1.5"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={e => setLocalFilters(f => ({ ...f, maxPrice: e.target.value }))}
                  className="input-field text-sm py-1.5"
                />
              </div>
              <button onClick={applyPriceFilter} className="btn-primary w-full text-sm py-2">Apply</button>
            </div>

            {/* Sort */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Sort By</p>
              <select
                value={sortBy}
                onChange={e => updateParam('sortBy', e.target.value)}
                className="input-field text-sm"
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-5">
            <div>
              {keyword && (
                <h2 className="text-lg font-semibold text-gray-800">
                  Results for "<span className="text-primary-500">{keyword}</span>"
                </h2>
              )}
              {category && !keyword && (
                <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
              )}
              {!keyword && !category && (
                <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
              )}
              <p className="text-sm text-gray-400">{products.length} items</p>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              title="No products found"
              message="Try adjusting your search or filters."
              action={<button onClick={clearFilters} className="btn-primary">Clear filters</button>}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === i ? 'bg-primary-500 text-white' : 'btn-secondary'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

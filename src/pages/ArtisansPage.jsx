import { useQuery } from '@tanstack/react-query'
import { api, mediaUrl } from '../lib/api.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ArtisansPage() {
  const trades = useQuery({ 
    queryKey: ['trades'], 
    queryFn: async () => (await api.get('/search/trades')).data 
  })
  
  const [trade, setTrade] = useState('')
  const [location, setLocation] = useState('')
  const [sort, setSort] = useState('rating')
  
  const list = useQuery({
    queryKey: ['search-artisans', trade, location, sort],
    queryFn: async () => (await api.get('/search/artisans', { params: { trade, location, sort } })).data,
    enabled: true
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50">
      {/* ✅ RESPONSIVE HERO */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=20')] bg-cover bg-center opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#1f4f9c] text-white rounded-full font-bold mb-6 sm:mb-8 text-xs sm:text-sm">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            10K+ Jobs Completed • 4.9⭐ Average
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-[#1f4f9c] bg-clip-text text-transparent mb-4 sm:mb-6">
            TOP ARTISANS
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed px-2">
            <span className="text-[#1f4f9c] font-bold">Plumbers • Electricians • Carpenters</span> - 
            Verified pros with 5⭐ reviews. Book in 30 seconds!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-12 sm:-mt-16 lg:-mt-20 space-y-8 sm:space-y-12 relative z-10">
        {/* ✅ RESPONSIVE FILTERS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="text-[#1f4f9c]">👷</span> Trade
              </label>
              <select 
                className="w-full p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm transition-all hover:shadow-xl"
                value={trade} onChange={e => setTrade(e.target.value)}
              >
                <option>All Trades</option>
                {trades.data?.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="text-[#1f4f9c]">📍</span> Location
              </label>
              <input 
                className="w-full p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm transition-all hover:shadow-xl"
                placeholder="Lagos • Abuja • Kano" 
                value={location} onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                <span className="text-[#1f4f9c]">⭐</span> Sort
              </label>
              <select 
                className="w-full p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm transition-all hover:shadow-xl"
                value={sort} onChange={e => setSort(e.target.value)}
              >
                <option>Top Rated</option>
                <option>Most Recent</option>
                <option>Lowest Price</option>
              </select>
            </div>

            <button 
              onClick={() => list.refetch()} 
              disabled={list.isFetching}
              className="group p-3 sm:p-4 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {list.isFetching ? (
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                  <div className="w-4 sm:w-6 h-4 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Searching</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3 justify-center">
                  <span className="text-xs sm:text-sm">🔍</span>
                  <span className="text-xs sm:text-base">Find Now</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* ✅ FIXED SKELETON LOADING - CORRECT SYNTAX! */}
        {list.isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden animate-pulse">
                <div className="h-48 sm:h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4">
                  <div className="h-6 sm:h-8 bg-gray-200 rounded-xl sm:rounded-2xl w-4/5"></div>
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-1 h-10 sm:h-12 sm:h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl"></div>
                    <div className="flex-1 h-10 sm:h-12 sm:h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl sm:rounded-2xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ RESPONSIVE RESULTS HEADER */}
        {list.data?.items?.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg sm:shadow-xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900">
                {list.data.items.length} FOUND
              </h2>
              <button 
                onClick={() => {setTrade(''); setLocation(''); setSort('rating');}} 
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-red-600 w-full sm:w-auto"
              >
                Clear All
              </button>
            </div>

            {/* ✅ RESPONSIVE ARTISANS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {list.data.items.map((p) => {
                const img = p.photoUrl ? mediaUrl(p.photoUrl) : 
                  `https://ui-avatars.com/api/?name=${p.trade}&background=1f4f9c&color=fff&size=512&bold=true&font-size=0.6`
                
                return (
                  <div key={p._id} className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden hover:shadow-xl sm:hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-4">
                    {/* IMAGE - RESPONSIVE HEIGHT */}
                    <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden">
                      <img 
                        src={img} 
                        alt={p.trade} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between">
                        <span className="bg-[#1f4f9c]/90 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                          {p.avgRating?.toFixed(1)}⭐
                        </span>
                        <span className="bg-white/90 text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                          {p.reviewsCount || 0} REVIEWS
                        </span>
                      </div>
                    </div>

                    {/* CONTENT - RESPONSIVE */}
                    <div className="p-4 sm:p-6 lg:p-8">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-3 sm:mb-4">{p.trade}</h3>
                      <div className="flex items-center justify-between mb-4 sm:mb-6 text-gray-600">
                        <span className="text-base sm:text-lg">📍 {p.location || 'Nationwide'}</span>
                      </div>
                      
                      {/* STARS - RESPONSIVE */}
                      <div className="flex gap-1 sm:gap-1 mb-4 sm:mb-6">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg sm:text-xl md:text-2xl ${
                            i < (p.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}>
                            ⭐
                          </span>
                        ))}
                      </div>

                      {/* PRICE - RESPONSIVE */}
                      {p.rate && (
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1f4f9c] mb-6 sm:mb-8">
                          ₦{p.rate.toLocaleString()}
                        </div>
                      )}

                      {/* BUTTONS - RESPONSIVE */}
                      <div className="flex gap-3 sm:gap-4">
                        <Link to={`/artisans/${p.user}`} 
                          className="flex-1 py-3 sm:py-4 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-xl sm:rounded-2xl font-bold text-center text-sm sm:text-base hover:bg-[#1f4f9c] hover:text-white transition-all shadow-lg"
                        >
                          👁️ VIEW
                        </Link>
                        <Link to="/bookings" state={{artisanId: p.user}} 
                          className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-xl sm:rounded-2xl font-bold text-center text-sm sm:text-base shadow-lg sm:shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                        >
                          🚀 BOOK
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* ✅ RESPONSIVE EMPTY STATE */}
        {!list.isFetching && list.data?.items?.length === 0 && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-12 sm:p-16 md:p-20 text-center">
            <div className="text-6xl sm:text-8xl md:text-9xl mb-6 sm:mb-8 animate-bounce">👷‍♂️</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">NOTHING FOUND</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-md mx-auto">Try different filters</p>
            <button onClick={() => {setTrade(''); setLocation(''); setSort('rating');}} 
              className="px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl"
            >
              🔄 RESET & SEARCH
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
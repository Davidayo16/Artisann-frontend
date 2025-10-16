import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api, mediaUrl } from '../lib/api.js'
import { useAuth } from '../lib/auth.jsx'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()
  const isArtisan = user?.role === 'artisan' || user?.role === 'admin'
  
  // Hardcoded list of common artisan trades
  const tradeOptions = [
    'Carpenter', 'Electrician', 'Plumber', 'Mason', 'Welder', 
    'Painter', 'Tiler', 'Roofer', 'HVAC Technician', 'Locksmith',
    'Glazier', 'Drywall Installer', 'Flooring Specialist', 'Roofing Contractor',
    'Bricklayer', 'Concrete Worker', 'Steel Fabricator', 'Pipe Fitter',
    'Solar Panel Installer', 'Generator Technician', 'Air Conditioner Repair',
    'Water Heater Installer', 'Furniture Maker', 'Cabinet Maker',
    'Window Installer', 'Door Installer', 'Ceiling Installer',
    'Pest Control', 'Landscaper', 'Fencing Contractor'
  ]
  
  const me = useQuery({ queryKey: ['me-profile'], queryFn: async () => (await api.get('/profiles/me')).data })
  
  const [trade, setTrade] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [rate, setRate] = useState('')
  const [photo, setPhoto] = useState(null)
  const photoInputRef = useRef(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (me.data) {
      setTrade(me.data.trade || '')
      setDescription(me.data.description || '')
      setLocation(me.data.location || '')
      setRate(me.data.rate != null ? String(me.data.rate) : '')
    }
  }, [me.data])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData()
      
      if (!trade.trim()) {
        throw new Error('Trade is required')
      }
      
      form.append('trade', trade.trim())
      form.append('description', description || '')
      form.append('location', location || '')
      if (rate) form.append('rate', rate)
      if (photo) form.append('photo', photo)
      
      return (await api.post('/profiles/me', form)).data
    },
    onSuccess: () => {
      setSaveSuccess(true)
      setPhoto(null)
      if (photoInputRef.current) photoInputRef.current.value = ''
      me.refetch()
      setTimeout(() => setSaveSuccess(false), 2000)
    },
    onError: (error) => {
      console.error('Save error:', error);
    }
  })

  const addItemMutation = useMutation({
    mutationFn: async (file) => {
      const form = new FormData()
      form.append('image', file)
      return (await api.post('/profiles/me/portfolio', form)).data
    },
    onSuccess: () => {
      setUploadSuccess(true)
      me.refetch()
      setTimeout(() => setUploadSuccess(false), 2000)
    }
  })

  const removeItemMutation = useMutation({
    mutationFn: async (index) => (await api.delete(`/profiles/me/portfolio/${index}`)).data,
    onSuccess: () => me.refetch()
  })

  const data = me.data
  const currentPhoto = photo ? URL.createObjectURL(photo) : mediaUrl(data?.photoUrl)

  if (me.isLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-2xl w-32 sm:w-48 mx-auto"></div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="h-20 sm:h-32 w-20 sm:w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto sm:mx-0"></div>
              <div className="space-y-3 sm:space-y-4 w-full">
                <div className="h-5 sm:h-6 bg-gray-200 rounded-xl w-3/4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-xl"></div>
                  <div className="h-10 sm:h-12 bg-gray-200 rounded-xl"></div>
                </div>
                <div className="h-20 sm:h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-10 sm:h-12 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] rounded-xl"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="h-6 sm:h-8 bg-gray-200 rounded-2xl w-24 sm:w-32 mx-auto"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="space-y-2 sm:space-y-3">
                  <div className="h-24 sm:h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 sm:h-8 bg-red-200 rounded-xl w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (me.isError) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="text-6xl sm:text-8xl mb-6 animate-bounce">😓</div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">PROFILE ERROR</h2>
        <button onClick={() => me.refetch()} 
          className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-2xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl"
        >
          🔄 RETRY
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-gray-900 to-[#1f4f9c] bg-clip-text text-transparent mb-2 sm:mb-4">
            YOUR PROFILE
          </h1>
          <div className="inline-flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-[#1f4f9c]/10 text-[#1f4f9c] rounded-full font-bold text-sm sm:text-base">
            <span className="w-2 h-2 bg-[#1f4f9c] rounded-full animate-ping"></span>
            {isArtisan ? 'ARTISAN DASHBOARD' : 'CLIENT DASHBOARD'}
          </div>
        </div>

        {isArtisan ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
              <div className="text-center">
                <div className="relative inline-block mx-auto">
                  <img 
                    src={currentPhoto || `https://ui-avatars.com/api/?name=${user.fullName}&background=1f4f9c&color=fff&size=256&bold=true`} 
                    className="h-20 sm:h-24 md:h-32 w-20 sm:w-24 md:w-32 rounded-2xl sm:rounded-3xl object-cover shadow-2xl border-4 border-white mx-auto" 
                    alt="Profile" 
                  />
                  <label className="absolute -bottom-2 -right-2 bg-[#1f4f9c] text-white p-2 sm:p-3 rounded-2xl sm:rounded-3xl cursor-pointer hover:scale-110 transition-transform shadow-xl text-sm sm:text-base">
                    📸
                    <input ref={photoInputRef} type="file" accept="image/*" 
                      onChange={e => setPhoto(e.target.files?.[0] || null)} 
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 mt-3 sm:mt-4">{user.fullName}</h2>
                <p className="text-gray-600 text-base sm:text-lg">📍 {location || 'Set Location'}</p>
              </div>

              {saveSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-2xl text-sm sm:text-base">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 bg-green-500 rounded-full animate-bounce"></div>
                  Profile Updated!
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                {/* Trade Dropdown */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-[#1f4f9c]">👷</span> Trade
                  </label>
                  <select 
                    className="w-full p-3 sm:p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm sm:text-base"
                    value={trade} 
                    onChange={e => setTrade(e.target.value)}
                    disabled={saveMutation.isPending}
                  >
                    <option value="">Select your trade</option>
                    {tradeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <input 
                  className="w-full p-3 sm:p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm sm:text-base"
                  placeholder="📍 Location (Lagos, Abuja...)" 
                  value={location} 
                  onChange={e => setLocation(e.target.value)}
                  disabled={saveMutation.isPending}
                />
                
                <input 
                  className="w-full p-3 sm:p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg text-sm sm:text-base"
                  type="number" 
                  placeholder="💰 Rate per Job (₦)" 
                  value={rate} 
                  onChange={e => setRate(e.target.value)}
                  disabled={saveMutation.isPending}
                />
                
                <textarea 
                  className="w-full p-3 sm:p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:border-[#1f4f9c] focus:ring-2 sm:focus:ring-4 focus:ring-[#1f4f9c]/10 shadow-lg min-h-20 sm:min-h-32 text-sm sm:text-base"
                  placeholder="✍️ Tell clients about your experience..." 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  disabled={saveMutation.isPending}
                />

                <button 
                  disabled={saveMutation.isPending || !trade.trim()}
                  onClick={() => saveMutation.mutate()} 
                  className="w-full py-3 sm:py-4 sm:py-5 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-2xl font-bold text-sm sm:text-base sm:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? (
                    <div className="flex items-center gap-2 sm:gap-3 justify-center">
                      <div className="w-4 sm:w-6 h-4 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">SAVING...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 sm:gap-3 justify-center">
                      <span>💾</span>
                      <span className="text-sm sm:text-xl">SAVE PROFILE</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900">PORTFOLIO</h2>
                <label className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-2xl font-bold cursor-pointer hover:shadow-xl text-sm sm:text-base w-full sm:w-auto text-center">
                  + ADD PHOTO
                  <input type="file" accept="image/*" 
                    onChange={e => e.target.files?.[0] && addItemMutation.mutate(e.target.files[0])} 
                    className="hidden"
                  />
                </label>
              </div>

              {uploadSuccess && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-2xl text-sm sm:text-base">
                  <div className="w-4 sm:w-5 h-4 sm:h-5 bg-green-500 rounded-full animate-bounce"></div>
                  Photo Added!
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {data?.portfolio?.map((item, idx) => (
                  <div key={idx} className="group relative bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                    <img 
                      src={mediaUrl(item.imageUrl)} 
                      className="w-full h-24 sm:h-32 md:h-40 object-cover group-hover:scale-110 transition-transform" 
                      alt="Portfolio" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => removeItemMutation.mutate(idx)} 
                        className="bg-red-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full font-bold text-xs sm:text-sm opacity-90 hover:opacity-100"
                      >
                        DELETE
                      </button>
                    </div>
                    <div className="p-2 sm:p-3">
                      <input 
                        defaultValue={item.title || ''} 
                        className="w-full p-1 sm:p-2 rounded text-xs sm:text-sm bg-transparent text-center" 
                        placeholder="Photo title"
                      />
                    </div>
                  </div>
                ))}
                {data?.portfolio?.length === 0 && (
                  <div className="col-span-full text-center py-12 sm:py-16">
                    <div className="text-4xl sm:text-6xl md:text-8xl mb-4 animate-bounce">📸</div>
                    <p className="text-gray-500 text-sm sm:text-base md:text-lg">Add your best work to attract more clients!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto text-center py-12 sm:py-20">
            <div className="text-6xl sm:text-8xl mb-6 sm:mb-8 animate-bounce">👋</div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 sm:mb-6">WELCOME CLIENT!</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Find & book trusted artisans for your home projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Link to="/artisans" 
                className="px-6 sm:px-12 py-3 sm:py-4 sm:py-5 bg-gradient-to-r from-[#1f4f9c] to-[#1a4689] text-white rounded-2xl font-bold text-sm sm:text-base sm:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 w-full sm:w-auto text-center"
              >
                🔍 BROWSE ARTISANS
              </Link>
              <Link to="/bookings" 
                className="px-6 sm:px-12 py-3 sm:py-4 sm:py-5 border-4 border-[#1f4f9c] text-[#1f4f9c] rounded-2xl font-bold text-sm sm:text-base sm:text-xl hover:bg-[#1f4f9c] hover:text-white shadow-xl w-full sm:w-auto text-center"
              >
                📅 MY BOOKINGS
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
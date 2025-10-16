import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function BookingPage() {
  const { user } = useAuth()
  const isUser = user?.role === 'user' || user?.role === 'admin'
  const isArtisanOnly = user?.role === 'artisan'
  const qc = useQueryClient()
  
  const my = useQuery({ 
    queryKey: ['my-bookings'], 
    queryFn: async () => (await api.get('/bookings/me')).data 
  })
  
  const locationState = useLocation()
  const [artisan, setArtisan] = useState('')
  const [serviceTitle, setServiceTitle] = useState('')
  const [date, setDate] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')
  const [payError, setPayError] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const aid = locationState?.state?.artisanId
    if (aid) setArtisan(String(aid))
  }, [locationState])

  useEffect(() => {
    async function loadRate() {
      try {
        if (!artisan) return
        const { data } = await api.get(`/profiles/user/${artisan}`)
        if (data?.rate != null && (amount === '' || Number(amount) <= 0)) {
          setAmount(String(data.rate))
        }
      } catch {}
    }
    loadRate()
  }, [artisan, amount])

  const create = useMutation({
    mutationFn: async () => (
      await api.post('/bookings', { 
        artisan, 
        serviceTitle, 
        date, 
        address, 
        note, 
        amount: Number(amount) || undefined 
      })
    ).data,
    onSuccess: () => { 
      setFormError(''); 
      qc.invalidateQueries({ queryKey: ['my-bookings'] }) 
    },
    onError: (err) => { 
      const msg = err?.response?.data?.message || 'Failed to create booking'; 
      setFormError(msg) 
    }
  })

  const confirmMutation = useMutation({
    mutationFn: async (id) => (await api.patch(`/bookings/${id}/status`, { status: 'confirmed' })).data,
    onSuccess: () => my.refetch()
  })
  
  const completeMutation = useMutation({
    mutationFn: async (id) => (await api.patch(`/bookings/${id}/status`, { status: 'completed' })).data,
    onSuccess: () => my.refetch()
  })
  
  const cancelMutation = useMutation({
    mutationFn: async (id) => (await api.patch(`/bookings/${id}/status`, { status: 'cancelled' })).data,
    onSuccess: () => my.refetch()
  })
  
  const releaseMutation = useMutation({
    mutationFn: async (id) => (await api.post(`/bookings/${id}/release`)).data,
    onSuccess: () => my.refetch()
  })

  const payMutation = useMutation({
    mutationFn: async (b) => {
      const callbackUrl = `${window.location.origin}/payment/callback?bookingId=${b._id}`
      return (await api.post('/payments/init', { 
        email: user?.email, 
        amount: b.amount || 0, 
        reference: `${b._id}-${Date.now()}`, 
        bookingId: b._id,
        callback_url: callbackUrl
      })).data
    },
    onSuccess: (data) => { 
      setPayError(''); 
      const url = data?.data?.authorization_url; 
      if (url) window.location.href = url 
    },
    onError: (err) => { 
      const msg = err?.response?.data?.message || 'Payment init failed'; 
      setPayError(msg) 
    }
  })

  function submitCreate() {
    if (!artisan) return setFormError('Please select an artisan (ID).')
    if (!serviceTitle) return setFormError('Please enter a service title.')
    if (!date) return setFormError('Please select a date/time.')
    create.mutate()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bookings</h1>
          <p className="text-lg text-gray-600">
            {isUser ? 'Create new bookings' : 'Manage your bookings'}
          </p>
        </div>

        {/* Errors */}
        {(payError || formError) && (
          <div className="bg-white rounded-lg shadow-sm p-4 border border-red-200">
            <p className="text-red-600 text-sm">{payError || formError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Booking Form */}
          {isUser && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Booking</h2>
              <div className="space-y-4">
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent" 
                  placeholder="Artisan User ID" 
                  value={artisan} 
                  onChange={e => setArtisan(e.target.value)} 
                />
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent" 
                  placeholder="Service title" 
                  value={serviceTitle} 
                  onChange={e => setServiceTitle(e.target.value)} 
                />
                <input 
                  type="datetime-local" 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent" 
                  placeholder="Address" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                />
                <input 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent" 
                  type="number" 
                  placeholder="Amount (NGN)" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f4f9c] focus:border-transparent min-h-24" 
                  placeholder="Note (optional)" 
                  value={note} 
                  onChange={e => setNote(e.target.value)} 
                />
                <button 
                  onClick={submitCreate} 
                  disabled={create.isPending} 
                  className="w-full p-3 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors disabled:bg-gray-400"
                >
                  {create.isPending ? 'Creating…' : 'Create Booking'}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  💡 Tip: Click "Book" on artisan profile to auto-fill ID
                </p>
                <p className="text-xs text-gray-500 text-center">
                  Flow: Confirm → Pay → Complete → Release
                </p>
              </div>
            </div>
          )}

          {/* Bookings List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isUser ? 'Your Bookings' : 'Your Jobs'}
            </h2>
            
            {my.isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-12 h-12 border-4 border-[#1f4f9c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            )}

            {my.isError && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-red-600 mb-4">Failed to load bookings.</p>
                <button 
                  onClick={() => my.refetch()} 
                  className="px-4 py-2 bg-[#1f4f9c] text-white rounded-lg hover:bg-[#1a4689]"
                >
                  Retry
                </button>
              </div>
            )}

            {!my.isLoading && !my.isError && !my.data?.length && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isUser ? 'No bookings yet' : 'No jobs yet'}
                </h3>
                <p className="text-gray-600">
                  {isArtisanOnly 
                    ? 'Clients can book you from your profile.' 
                    : 'Create your first booking above.'
                  }
                </p>
              </div>
            )}

            {!my.isLoading && !my.isError && my.data?.map(b => (
              <div key={b._id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {/* Booking Details */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{b.serviceTitle}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{new Date(b.date).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      b.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{b.address}</p>
                  {b.artisan?.fullName && (
                    <p className="text-sm text-gray-600">👷 {b.artisan.fullName}</p>
                  )}
                  {typeof b.amount === 'number' && (
                    <p className="text-lg font-semibold text-[#1f4f9c]">
                      ₦{b.amount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Payment Badge */}
                {b.paymentStatus && (
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${
                      b.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                      b.paymentStatus === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      💳 {b.paymentStatus} {b.released ? '• Released' : ''}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* ARTISAN ACTIONS */}
                  {isArtisanOnly && b.status === 'pending' && (
                    <button 
                      onClick={() => confirmMutation.mutate(b._id)} 
                      disabled={confirmMutation.isPending}
                      className="flex-1 px-4 py-2 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors text-sm"
                    >
                      {confirmMutation.isPending ? 'Confirming…' : 'Confirm'}
                    </button>
                  )}
                  
                  {isArtisanOnly && b.status === 'confirmed' && b.paymentStatus !== 'success' && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">Awaiting payment</span>
                  )}
                  
                  {isArtisanOnly && b.status === 'confirmed' && b.paymentStatus === 'success' && (
                    <button 
                      onClick={() => completeMutation.mutate(b._id)} 
                      disabled={completeMutation.isPending}
                      className="flex-1 px-4 py-2 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors text-sm"
                    >
                      {completeMutation.isPending ? 'Completing…' : 'Mark Complete'}
                    </button>
                  )}
                  
                  {isArtisanOnly && b.status === 'completed' && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded">Awaiting release</span>
                  )}

                  {/* USER ACTIONS */}
                  {isUser && b.status === 'pending' && (
                    <button 
                      onClick={() => cancelMutation.mutate(b._id)} 
                      disabled={cancelMutation.isPending}
                      className="flex-1 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-500 hover:text-white transition-colors text-sm"
                    >
                      {cancelMutation.isPending ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                  
                  {isUser && b.status === 'confirmed' && b.paymentStatus !== 'success' && (b.amount || 0) > 0 && (
                    <button 
                      onClick={() => payMutation.mutate(b)} 
                      disabled={payMutation.isPending}
                      className="flex-1 px-4 py-2 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors text-sm"
                    >
                      {payMutation.isPending ? 'Redirecting…' : 'Pay with Paystack'}
                    </button>
                  )}
                  
                  {isUser && b.status === 'confirmed' && b.paymentStatus === 'success' && (
                    <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded font-medium">✓ Paid</span>
                  )}
                  
                  {isUser && b.status === 'completed' && b.paymentStatus === 'success' && !b.released && (
                    <button 
                      onClick={() => releaseMutation.mutate(b._id)} 
                      disabled={releaseMutation.isPending}
                      className="flex-1 px-4 py-2 border-2 border-green-500 text-green-500 rounded-lg font-medium hover:bg-green-500 hover:text-white transition-colors text-sm"
                    >
                      {releaseMutation.isPending ? 'Releasing…' : 'Release Funds'}
                    </button>
                  )}
                  
                  {b.released && (
                    <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded font-medium">✓ Released</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
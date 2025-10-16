import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, mediaUrl } from '../lib/api.js'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { useState } from 'react'

export default function ArtisanDetailPage() {
	const { id } = useParams()
	const { user } = useAuth()
	const qc = useQueryClient()
	const profile = useQuery({ 
		queryKey: ['artisan-profile', id], 
		queryFn: async () => (await api.get(`/profiles/user/${id}`)).data 
	})
	const reviews = useQuery({ 
		queryKey: ['artisan-reviews', id], 
		queryFn: async () => (await api.get(`/reviews/artisan/${id}`)).data 
	})
	
	const [rating, setRating] = useState(5)
	const [comment, setComment] = useState('')
	const [showReviewForm, setShowReviewForm] = useState(false)
	
	const createReview = useMutation({
		mutationFn: async () => (await api.post('/reviews', { artisan: id, rating, comment })).data,
		onSuccess: () => { 
			setComment('')
			setRating(5)
			setShowReviewForm(false)
			qc.invalidateQueries({ queryKey: ['artisan-reviews', id] })
			qc.invalidateQueries({ queryKey: ['artisan-profile', id] })
		}
	})

	if (profile.isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
				<div className="max-w-7xl mx-auto px-6 py-12">
					<div className="animate-pulse space-y-8">
						<div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2 space-y-6">
								<div className="bg-white rounded-2xl p-8 space-y-4">
									<div className="h-8 bg-gray-200 rounded w-3/4"></div>
									<div className="h-4 bg-gray-200 rounded w-full"></div>
									<div className="h-4 bg-gray-200 rounded w-5/6"></div>
								</div>
							</div>
							<div className="bg-white rounded-2xl p-6 h-96"></div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (profile.isError) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-md">
					<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
						<span className="text-4xl">⚠️</span>
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Profile</h2>
					<p className="text-gray-600 mb-6">We couldn't fetch this artisan's details. Please try again.</p>
					<Link to="/artisans" className="px-6 py-3 bg-[#1f4f9c] text-white rounded-xl font-semibold inline-block hover:bg-[#1a4689] transition-all">
						Back to Artisans
					</Link>
				</div>
			</div>
		)
	}

	const p = profile.data
	const avatar = p?.photoUrl ? mediaUrl(p.photoUrl) : 
		`https://ui-avatars.com/api/?name=${encodeURIComponent(p?.trade||'Artisan')}&background=1f4f9c&color=fff&size=512`
	
	const canReview = !!user && (user.role === 'user' || user.role === 'admin') && user._id !== id
	const avgRating = reviews.data?.length ? 
		(reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length).toFixed(1) : 0

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
			<div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
				{/* HERO HEADER */}
				<div className="relative bg-gradient-to-br from-[#1f4f9c] to-[#1a4689] rounded-2xl overflow-hidden shadow-2xl">
					<div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
					<div className="relative p-8 md:p-12">
						<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
							<div className="relative">
								<img 
									src={avatar} 
									className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20 shadow-xl" 
									alt={p.trade} 
								/>
								{avgRating > 0 && (
									<div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-3 py-1.5 shadow-lg">
										<div className="flex items-center gap-1">
											<span className="text-yellow-500 text-lg">★</span>
											<span className="font-bold text-gray-900">{avgRating}</span>
										</div>
									</div>
								)}
							</div>
							
							<div className="flex-1 text-white">
								<h1 className="text-4xl md:text-5xl font-bold mb-2">{p.trade}</h1>
								<div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
									<div className="flex items-center gap-2">
										<span>📍</span>
										<span className="font-medium">{p.location || 'Nigeria'}</span>
									</div>
									{reviews.data?.length > 0 && (
										<div className="flex items-center gap-2">
											<span>💬</span>
											<span className="font-medium">{reviews.data.length} {reviews.data.length === 1 ? 'Review' : 'Reviews'}</span>
										</div>
									)}
								</div>
								{p.rate && (
									<div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2">
										<div className="text-sm text-white/80">Starting from</div>
										<div className="text-2xl font-bold">₦{p.rate.toLocaleString()}</div>
									</div>
								)}
							</div>

							<Link 
								to="/bookings" 
								state={{ artisanId: id }} 
								className="px-8 py-4 bg-white text-[#1f4f9c] rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all whitespace-nowrap"
							>
								Book Now
							</Link>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* MAIN CONTENT */}
					<div className="lg:col-span-2 space-y-8">
						{/* ABOUT */}
						<div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
							<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
								<span>👤</span>
								About
							</h2>
							<p className="text-gray-700 leading-relaxed">
								{p.description || 'This artisan has not provided a description yet.'}
							</p>
						</div>

						{/* PORTFOLIO */}
						{p.portfolio?.length > 0 && (
							<div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
								<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
									<span>🎨</span>
									Portfolio
								</h2>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									{p.portfolio.map((item, i) => (
										<div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
											<img 
												src={mediaUrl(item.imageUrl)} 
												className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
												alt={`Portfolio ${i + 1}`} 
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* ALL REVIEWS */}
						{reviews.data?.length > 0 && (
							<div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
								<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
									<span>⭐</span>
									All Reviews
								</h2>
								<div className="space-y-4">
									{reviews.data.map(r => (
										<div key={r._id} className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													{[...Array(5)].map((_, i) => (
														<span key={i} className={`text-lg ${
															i < r.rating ? 'text-yellow-400' : 'text-gray-300'
														}`}>
															★
														</span>
													))}
												</div>
												{r.createdAt && (
													<span className="text-sm text-gray-500">
														{new Date(r.createdAt).toLocaleDateString()}
													</span>
												)}
											</div>
											<p className="text-gray-700 leading-relaxed">{r.comment}</p>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* SIDEBAR */}
					<div className="space-y-6">
						{/* RATING SUMMARY */}
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h3 className="text-xl font-bold text-gray-900 mb-4">Rating Summary</h3>
							
							{reviews.data?.length > 0 ? (
								<>
									<div className="text-center mb-6 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl">
										<div className="text-5xl font-bold text-gray-900 mb-2">{avgRating}</div>
										<div className="flex items-center justify-center gap-1 mb-2">
											{[...Array(5)].map((_, i) => (
												<span key={i} className={`text-2xl ${
													i < Math.floor(avgRating) ? 'text-yellow-400' : 'text-gray-300'
												}`}>
													★
												</span>
											))}
										</div>
										<p className="text-sm text-gray-600">
											Based on {reviews.data.length} {reviews.data.length === 1 ? 'review' : 'reviews'}
										</p>
									</div>

									{/* RATING BREAKDOWN */}
									<div className="space-y-2">
										{[5, 4, 3, 2, 1].map(star => {
											const count = reviews.data.filter(r => r.rating === star).length
											const percentage = (count / reviews.data.length) * 100
											return (
												<div key={star} className="flex items-center gap-3">
													<span className="text-sm font-medium text-gray-700 w-12">{star}★</span>
													<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
														<div 
															className="h-full bg-[#1f4f9c] rounded-full transition-all"
															style={{ width: `${percentage}%` }}
														></div>
													</div>
													<span className="text-sm text-gray-600 w-8 text-right">{count}</span>
												</div>
											)
										})}
									</div>
								</>
							) : (
								<div className="text-center py-8">
									<div className="text-4xl mb-3">⭐</div>
									<p className="text-gray-600">No reviews yet</p>
								</div>
							)}
						</div>

						{/* REVIEW FORM */}
						{canReview && (
							<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
								<h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
								
								{!showReviewForm ? (
									<button
										onClick={() => setShowReviewForm(true)}
										className="w-full py-3 bg-[#1f4f9c] text-white rounded-xl font-semibold hover:bg-[#1a4689] transition-all"
									>
										Leave a Review
									</button>
								) : (
									<div className="space-y-4">
										{createReview.isError && (
											<div className="bg-red-50 border border-red-200 rounded-xl p-4">
												<p className="text-sm text-red-700 font-medium">Failed to submit review. Please try again.</p>
											</div>
										)}

										{/* STAR RATING SELECTOR */}
										<div>
											<label className="text-sm font-semibold text-gray-700 mb-2 block">Your Rating</label>
											<div className="flex gap-2">
												{[1, 2, 3, 4, 5].map(star => (
													<button
														key={star}
														onClick={() => setRating(star)}
														className="text-4xl transition-all hover:scale-110"
													>
														<span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
															★
														</span>
													</button>
												))}
											</div>
										</div>

										{/* COMMENT */}
										<div>
											<label className="text-sm font-semibold text-gray-700 mb-2 block">Your Experience</label>
											<textarea 
												className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#1f4f9c] focus:ring-2 focus:ring-[#1f4f9c]/20 focus:bg-white transition-all resize-none"
												placeholder="Share your experience with this artisan..."
												rows="4"
												value={comment} 
												onChange={e => setComment(e.target.value)}
											/>
										</div>

										{/* BUTTONS */}
										<div className="flex gap-3">
											<button
												onClick={() => {
													setShowReviewForm(false)
													setComment('')
													setRating(5)
												}}
												className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
												disabled={createReview.isPending}
											>
												Cancel
											</button>
											<button
												onClick={() => createReview.mutate()}
												disabled={createReview.isPending || !comment.trim()}
												className="flex-1 py-3 bg-[#1f4f9c] text-white rounded-xl font-semibold hover:bg-[#1a4689] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{createReview.isPending ? (
													<div className="flex items-center justify-center gap-2">
														<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
														<span>Submitting...</span>
													</div>
												) : (
													'Submit Review'
												)}
											</button>
										</div>
									</div>
								)}
							</div>
						)}

						{!canReview && !user && (
							<div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
								<p className="text-sm text-gray-600 text-center">
									<Link to="/login" className="text-[#1f4f9c] font-semibold hover:underline">
										Sign in
									</Link>
									{' '}to leave a review
								</p>
							</div>
						)}
						
						{!canReview && user && user._id === id && (
							<div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
								<p className="text-sm text-gray-600 text-center">
									You cannot review your own profile
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function JobsPage() {
	const { user } = useAuth()
	const isUser = user?.role === 'user' || user?.role === 'admin'
	const isArtisan = user?.role === 'artisan' || user?.role === 'admin'
	const qc = useQueryClient()

	// Job listing with filters
	const [filters, setFilters] = useState({ trade: '', location: '', status: 'open' })
	const list = useQuery({ 
		queryKey: ['jobs', filters], 
		queryFn: async () => (await api.get('/jobs', { params: filters })).data 
	})

	// Create job form
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [trade, setTrade] = useState('')
	const [location, setLocation] = useState('')
	const [budgetMin, setBudgetMin] = useState('')
	const [budgetMax, setBudgetMax] = useState('')
	const [showJobForm, setShowJobForm] = useState(false)
	const [formError, setFormError] = useState('')

	const createJob = useMutation({
		mutationFn: async () => {
			if (!title || !description || !trade) {
				throw new Error('Please fill all required fields')
			}
			return (await api.post('/jobs', { 
				title, 
				description, 
				trade, 
				location,
				budgetMin: budgetMin ? Number(budgetMin) : undefined,
				budgetMax: budgetMax ? Number(budgetMax) : undefined
			})).data
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['jobs'] })
			setTitle('')
			setDescription('')
			setTrade('')
			setLocation('')
			setBudgetMin('')
			setBudgetMax('')
			setShowJobForm(false)
			setFormError('')
		},
		onError: (err) => {
			setFormError(err?.response?.data?.message || err.message || 'Failed to post job')
		}
	})

	// Bidding system
	const [selectedJob, setSelectedJob] = useState(null)
	const [bidAmount, setBidAmount] = useState('')
	const [bidMsg, setBidMsg] = useState('')
	const [bidError, setBidError] = useState('')
	const [bidSuccess, setBidSuccess] = useState('')

	const bidMutation = useMutation({
		mutationFn: async ({ jobId, amount, message }) => {
			if (!amount || Number(amount) <= 0) {
				throw new Error('Please enter a valid bid amount')
			}
			const response = await api.post('/bids', { 
				job: jobId, 
				amount: Number(amount), 
				message 
			})
			return response.data
		},
		onSuccess: (data) => {
			setBidAmount('')
			setBidMsg('')
			setBidError('')
			setBidSuccess('Bid submitted successfully!')
			
			// Clear success message after 3 seconds
			setTimeout(() => {
				setBidSuccess('')
				setSelectedJob(null)
			}, 3000)
			
			qc.invalidateQueries({ queryKey: ['jobs'] })
		},
		onError: (err) => {
			const errorMsg = err?.response?.data?.message || err.message || 'Failed to submit bid'
			setBidError(errorMsg)
			console.error('Bid error:', err)
		}
	})

	// Get artisan's own bids to check if already bid
	const myBidsQuery = useQuery({
		queryKey: ['myBids'],
		queryFn: async () => {
			if (!isArtisan) return []
			const response = await api.get('/bids/my-bids')
			return response.data
		},
		enabled: isArtisan
	})

	// Check if artisan already bid on a job
	const hasAlreadyBid = (jobId) => {
		if (!myBidsQuery.data) return false
		return myBidsQuery.data.some(bid => bid.job === jobId || bid.job?._id === jobId)
	}

	// View bids for a job
	const [viewingBids, setViewingBids] = useState(null)
	const bidsQuery = useQuery({
		queryKey: ['bids', viewingBids],
		queryFn: async () => {
			const response = await api.get(`/bids/job/${viewingBids}`)
			return response.data
		},
		enabled: !!viewingBids,
		retry: 1
	})

	const awardMutation = useMutation({
		mutationFn: async ({ jobId, bidId }) => {
			const response = await api.post('/jobs/award', { jobId, bidId })
			return response.data
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['jobs'] })
			qc.invalidateQueries({ queryKey: ['bids'] })
			setViewingBids(null)
		},
		onError: (err) => {
			alert(err?.response?.data?.message || 'Failed to award bid')
		}
	})

	const trades = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Masonry', 'Welding', 'Other']
	const data = list.data

	const handleBidSubmit = (jobId) => {
		setBidError('')
		setBidSuccess('')
		bidMutation.mutate({ jobId, amount: bidAmount, message: bidMsg })
	}

	const handleBidCancel = () => {
		setSelectedJob(null)
		setBidAmount('')
		setBidMsg('')
		setBidError('')
		setBidSuccess('')
	}

	return (
		<div className="min-h-screen bg-gray-50 py-6 px-4">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Job Marketplace</h1>
						<p className="text-gray-600 mt-1">
							{isUser ? 'Post jobs and receive bids from skilled artisans' : 'Browse jobs and submit your bids'}
						</p>
					</div>
					{isUser && (
						<button 
							onClick={() => setShowJobForm(!showJobForm)} 
							className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
						>
							{showJobForm ? '✕ Cancel' : '+ Post New Job'}
						</button>
					)}
				</div>

				{/* Create Job Form */}
				{isUser && showJobForm && (
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h2 className="text-xl font-semibold mb-4">Post a New Job</h2>
						{formError && (
							<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
								{formError}
							</div>
						)}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Job Title <span className="text-red-500">*</span>
								</label>
								<input 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									placeholder="e.g., Fix leaking kitchen faucet" 
									value={title} 
									onChange={e => setTitle(e.target.value)} 
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Trade <span className="text-red-500">*</span>
								</label>
								<select 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									value={trade} 
									onChange={e => setTrade(e.target.value)}
								>
									<option value="">Select trade...</option>
									{trades.map(t => <option key={t} value={t}>{t}</option>)}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
								<input 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									placeholder="e.g., Kano, Nigeria" 
									value={location} 
									onChange={e => setLocation(e.target.value)} 
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Min Budget (₦)</label>
								<input 
									type="number" 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									placeholder="e.g., 5000" 
									value={budgetMin} 
									onChange={e => setBudgetMin(e.target.value)} 
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Max Budget (₦)</label>
								<input 
									type="number" 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
									placeholder="e.g., 10000" 
									value={budgetMax} 
									onChange={e => setBudgetMax(e.target.value)} 
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Description <span className="text-red-500">*</span>
								</label>
								<textarea 
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-32" 
									placeholder="Describe the job in detail..." 
									value={description} 
									onChange={e => setDescription(e.target.value)} 
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<button 
								onClick={() => setShowJobForm(false)} 
								className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancel
							</button>
							<button 
								onClick={() => createJob.mutate()} 
								disabled={createJob.isPending} 
								className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{createJob.isPending ? 'Posting...' : 'Post Job'}
							</button>
						</div>
					</div>
				)}

				{/* Filters */}
				<div className="bg-white rounded-lg shadow p-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<select 
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={filters.trade} 
							onChange={e => setFilters({...filters, trade: e.target.value})}
						>
							<option value="">All Trades</option>
							{trades.map(t => <option key={t} value={t}>{t}</option>)}
						</select>
						<input 
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							placeholder="Filter by location" 
							value={filters.location} 
							onChange={e => setFilters({...filters, location: e.target.value})}
						/>
						<select 
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={filters.status} 
							onChange={e => setFilters({...filters, status: e.target.value})}
						>
							<option value="">All Status</option>
							<option value="open">Open</option>
							<option value="awarded">Awarded</option>
							<option value="completed">Completed</option>
						</select>
					</div>
				</div>

				{/* Jobs List */}
				<div className="space-y-4">
					{list.isLoading && (
						<div className="bg-white rounded-lg shadow p-6 text-center py-12">
							<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p className="text-gray-600">Loading jobs...</p>
						</div>
					)}
					
					{list.isError && (
						<div className="bg-white rounded-lg shadow p-6 text-center py-12 text-red-600">
							Failed to load jobs. Please try again.
						</div>
					)}

					{!list.isLoading && !list.isError && data?.items?.length === 0 && (
						<div className="bg-white rounded-lg shadow p-6 text-center py-12">
							<div className="text-6xl mb-4">📋</div>
							<h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
							<p className="text-gray-500">
								{isUser ? 'Be the first to post a job!' : 'Check back later for new opportunities'}
							</p>
						</div>
					)}

					{!list.isLoading && !list.isError && data?.items?.map(job => (
						<div key={job._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
							<div className="flex flex-col lg:flex-row justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-start justify-between gap-3 mb-3">
										<div>
											<h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
											<div className="flex flex-wrap gap-2 mt-2">
												<span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
													{job.trade}
												</span>
												<span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
													job.status === 'open' ? 'bg-green-100 text-green-700' :
													job.status === 'awarded' ? 'bg-yellow-100 text-yellow-700' :
													'bg-gray-100 text-gray-700'
												}`}>
													{job.status}
												</span>
												{job.location && (
													<span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
														📍 {job.location}
													</span>
												)}
											</div>
										</div>
									</div>
									
									<p className="text-gray-700 mb-3">{job.description}</p>
									
									{(job.budgetMin || job.budgetMax) && (
										<div className="text-sm text-gray-600 mb-3">
											<span className="font-medium">Budget: </span>
											{job.budgetMin && job.budgetMax 
												? `₦${job.budgetMin.toLocaleString()} - ₦${job.budgetMax.toLocaleString()}`
												: job.budgetMin 
												? `From ₦${job.budgetMin.toLocaleString()}`
												: `Up to ₦${job.budgetMax.toLocaleString()}`
											}
										</div>
									)}

									<div className="text-xs text-gray-500">
										Posted {new Date(job.createdAt).toLocaleDateString()}
									</div>
								</div>

								{/* Actions */}
								<div className="flex flex-col gap-2 lg:min-w-[200px]">
									{isArtisan && job.status === 'open' && selectedJob !== job._id && (
										<button 
											onClick={() => {
												setSelectedJob(job._id)
												setBidError('')
												setBidSuccess('')
											}} 
											className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
										>
											Submit Bid
										</button>
									)}

									{isUser && job.postedBy === user?.id && (
										<button 
											onClick={() => setViewingBids(job._id)} 
											className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
										>
											View Bids ({job.bidCount || 0})
										</button>
									)}
								</div>
							</div>

							{/* Bid Form */}
							{isArtisan && selectedJob === job._id && (
								<div className="mt-4 pt-4 border-t">
									<h4 className="font-semibold mb-3">Submit Your Bid</h4>
									
									{bidError && (
										<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-3">
											{bidError}
										</div>
									)}
									
									{bidSuccess && (
										<div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 mb-3">
											{bidSuccess}
										</div>
									)}
									
									<div className="space-y-3">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Your Bid Amount (₦) <span className="text-red-500">*</span>
											</label>
											<input 
												type="number"
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
												placeholder="Enter amount" 
												value={bidAmount} 
												onChange={e => setBidAmount(e.target.value)}
												disabled={bidMutation.isPending}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Message to Client (Optional)
											</label>
											<textarea 
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-20" 
												placeholder="Tell the client why you're the best choice for this job" 
												value={bidMsg} 
												onChange={e => setBidMsg(e.target.value)}
												disabled={bidMutation.isPending}
											/>
										</div>
										<div className="flex gap-2">
											<button 
												onClick={handleBidCancel} 
												disabled={bidMutation.isPending}
												className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
											>
												Cancel
											</button>
											<button 
												onClick={() => handleBidSubmit(job._id)} 
												disabled={bidMutation.isPending || !bidAmount} 
												className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1 disabled:bg-gray-400 disabled:cursor-not-allowed"
											>
												{bidMutation.isPending ? 'Submitting...' : 'Submit Bid'}
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				{/* Pagination */}
				{data && data.totalPages > 1 && (
					<div className="flex justify-center gap-2">
						{Array.from({ length: data.totalPages }, (_, i) => i + 1).map(page => (
							<button 
								key={page}
								className={`px-4 py-2 rounded-lg transition-colors ${
									page === data.page 
										? 'bg-blue-600 text-white' 
										: 'bg-white text-gray-700 hover:bg-gray-100'
								}`}
								onClick={() => setFilters({...filters, page})}
							>
								{page}
							</button>
						))}
					</div>
				)}

				{/* Bids Modal */}
				{viewingBids && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
							<div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
								<h2 className="text-xl font-semibold">Bids Received</h2>
								<button 
									onClick={() => setViewingBids(null)} 
									className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
								>
									×
								</button>
							</div>
							<div className="p-4 space-y-3">
								{bidsQuery.isLoading && (
									<div className="text-center py-8">
										<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
										<p className="text-gray-600">Loading bids...</p>
									</div>
								)}
								{bidsQuery.isError && (
									<div className="text-center py-8 text-red-600">
										Failed to load bids. Please try again.
									</div>
								)}
								{bidsQuery.data?.length === 0 && (
									<div className="text-center py-8 text-gray-500">No bids yet</div>
								)}
								{bidsQuery.data?.map(bid => (
									<div key={bid._id} className="border rounded-lg p-4">
										<div className="flex justify-between items-start mb-2">
											<div>
												<div className="font-medium text-lg">₦{bid.amount.toLocaleString()}</div>
												<div className="text-sm text-gray-600">{bid.artisan?.fullName || 'Artisan'}</div>
												<div className="text-xs text-gray-500">{bid.artisan?.email}</div>
											</div>
											<span className={`px-3 py-1 text-xs rounded-full font-medium ${
												bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
												bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
												'bg-gray-100 text-gray-700'
											}`}>
												{bid.status}
											</span>
										</div>
										{bid.message && (
											<p className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded">{bid.message}</p>
										)}
										{bid.status === 'pending' && (
											<button 
												onClick={() => awardMutation.mutate({ jobId: viewingBids, bidId: bid._id })}
												disabled={awardMutation.isPending}
												className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
											>
												{awardMutation.isPending ? 'Awarding...' : 'Award This Bid'}
											</button>
										)}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
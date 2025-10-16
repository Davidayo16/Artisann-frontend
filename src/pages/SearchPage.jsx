import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { useState } from 'react'

export default function SearchPage() {
	const [trade, setTrade] = useState('')
	const [location, setLocation] = useState('')
	const { data, isFetching, isLoading, isError, refetch } = useQuery({
		queryKey: ['search', trade, location],
		queryFn: async () => (await api.get('/search/artisans', { params: { trade, location } })).data,
		enabled: false
	})
	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Search artisans</h1>
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
				<input placeholder="Trade (e.g., Plumber)" className="input" value={trade} onChange={e=>setTrade(e.target.value)} />
				<input placeholder="Location (e.g., Lagos)" className="input" value={location} onChange={e=>setLocation(e.target.value)} />
				<button onClick={()=>refetch()} disabled={isFetching} aria-busy={isFetching} className="btn btn-primary">{isFetching ? 'Searching…' : 'Search'}</button>
			</div>
			{isLoading && <p>Loading…</p>}
			{isError && <p className="text-red-600">Failed to search artisans.</p>}
			{!isFetching && data && data.items.length === 0 && (
				<div className="text-sm text-muted">No artisans found. Try different filters.</div>
			)}
			{data && data.items.length > 0 && (
				<ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
					{data.items.map((p)=> (
						<li key={p._id} className="card">
							<div className="font-medium">{p.trade} • {p.location}</div>
							<div className="text-sm text-muted">Rating: {p.avgRating?.toFixed?.(1) || 0} ({p.reviewsCount})</div>
							{p.photoUrl && <img src={p.photoUrl} alt="profile" className="mt-2 aspect-[4/3] w-full object-cover rounded" />}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

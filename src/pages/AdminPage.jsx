import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'

export default function AdminPage() {
	const stats = useQuery({ queryKey: ['admin-stats'], queryFn: async () => (await api.get('/admin/stats')).data })
	const users = useQuery({ queryKey: ['admin-users'], queryFn: async () => (await api.get('/admin/users')).data })
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Admin</h1>
			{stats.isLoading && <div>Loading stats…</div>}
			{stats.isError && <div className="text-red-600">Failed to load stats.</div>}
			{stats.data && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<Stat title="Users" value={stats.data.users} />
					<Stat title="Artisans" value={stats.data.artisans} />
					<Stat title="Jobs" value={stats.data.jobs} />
					<Stat title="Reviews" value={stats.data.reviews} />
				</div>
			)}
			<div className="card">
				<div className="p-1 sm:p-2 font-medium border-b">Users</div>
				<div className="overflow-auto">
					{users.isLoading && <div className="p-3">Loading users…</div>}
					{users.isError && <div className="p-3 text-red-600">Failed to load users.</div>}
					{users.data && (
						<table className="min-w-full text-sm">
							<thead>
								<tr className="text-left text-muted">
									<th className="px-3 py-2">Name</th>
									<th className="px-3 py-2">Email</th>
									<th className="px-3 py-2">Role</th>
								</tr>
							</thead>
							<tbody>
								{users.data.map(u => (
									<tr key={u.id || u._id} className="border-t">
										<td className="px-3 py-2 whitespace-nowrap">{u.fullName}</td>
										<td className="px-3 py-2 whitespace-nowrap">{u.email}</td>
										<td className="px-3 py-2 whitespace-nowrap">{u.role}</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</div>
		</div>
	)
}

function Stat({ title, value }) {
	return (
		<div className="rounded-lg border bg-white p-3">
			<div className="text-sm text-muted">{title}</div>
			<div className="text-2xl font-semibold">{value}</div>
		</div>
	)
}

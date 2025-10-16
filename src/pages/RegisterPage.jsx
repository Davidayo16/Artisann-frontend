import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { registerRequest, useAuth } from '../lib/auth.jsx'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

const schema = z.object({
	fullName: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['user','artisan']).default('user'),
	trade: z.string().optional()
})

export default function RegisterPage() {
	const navigate = useNavigate()
	const { setToken, setUser } = useAuth()
	const trades = useQuery({ queryKey: ['trades'], queryFn: async () => (await api.get('/search/trades')).data })
	const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { role: 'user' } })
	const role = watch('role')
	const mutation = useMutation({
		mutationFn: async (values)=> {
			const body = { fullName: values.fullName, email: values.email, password: values.password, role: values.role }
			if (values.role === 'artisan' && values.trade) body.trade = values.trade
			return await registerRequest(body)
		},
		onSuccess: (data) => {
			setToken(data.token)
			setUser(data.user)
			navigate('/')
		}
	})
	const code = mutation.error?.response?.status
	const serverMsg = code === 409 ? 'Email already in use' : mutation.error?.response?.data?.message || (mutation.isError ? 'Registration failed' : '')
	return (
		<div className="max-w-md w-full mx-auto">
			<h1 className="text-2xl font-semibold mb-4">Create your account</h1>
			{serverMsg && <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{serverMsg}</div>}
			<form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
				<input placeholder="Full name" className="input" {...register('fullName')} />
				{errors.fullName && <p className="text-red-600 text-sm">{errors.fullName.message}</p>}
				<input placeholder="Email" className="input" {...register('email')} />
				{errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
				<input type="password" placeholder="Password" className="input" {...register('password')} />
				{errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
				<select className="input" {...register('role')}>
					<option value="user">User</option>
					<option value="artisan">Artisan</option>
				</select>
				{role === 'artisan' && (
					<select className="input" {...register('trade')}>
						<option value="">Select trade (optional)</option>
						{trades.data?.map(t => <option key={t} value={t}>{t}</option>)}
					</select>
				)}
				<button disabled={mutation.isPending} aria-busy={mutation.isPending} className="btn btn-primary w-full">
					{mutation.isPending ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		</div>
	)
}

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { loginRequest, useAuth } from '../lib/auth.jsx'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
})

export default function LoginPage() {
	const navigate = useNavigate()
	const { setToken, setUser } = useAuth()
	const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
	const mutation = useMutation({
		mutationFn: loginRequest,
		onSuccess: (data) => {
			setToken(data.token)
			setUser(data.user)
			navigate('/')
		},
		onError: ()=>{}
	})
	const serverMsg = mutation.error?.response?.data?.message || (mutation.isError ? 'Login failed' : '')
	return (
		<div className="max-w-md w-full mx-auto">
			<h1 className="text-2xl font-semibold mb-4">Login</h1>
			{serverMsg && <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{serverMsg}</div>}
			<form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-3">
				<input placeholder="Email" className="input" {...register('email')} />
				{errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
				<input type="password" placeholder="Password" className="input" {...register('password')} />
				{errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
				<button disabled={mutation.isPending} aria-busy={mutation.isPending} className="btn btn-primary w-full">
					{mutation.isPending ? 'Signing in…' : 'Sign In'}
				</button>
			</form>
		</div>
	)
}

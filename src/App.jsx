import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import JobsPage from './pages/JobsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import ArtisansPage from './pages/ArtisansPage.jsx'
import ArtisanDetailPage from './pages/ArtisanDetailPage.jsx'
import PaymentCallback from './pages/PaymentCallback.jsx';

const queryClient = new QueryClient()

function Protected({ roles, children }) {
	const { user } = useAuth()
	if (!user) return <Navigate to="/login" replace />
	if (roles && roles.length && !roles.includes(user.role)) return <Navigate to="/" replace />
	return children
}

function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  
  function close() { setOpen(false) }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 flex items-center justify-between py-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-bold text-[#1f4f9c]" 
          onClick={close}
        >
          Artisan Market
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/artisans" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Artisans</Link>
          {/* <Link to="/search" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Search</Link> */}
          <Link to="/jobs" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Jobs</Link>
          {user && <Link to="/bookings" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Bookings</Link>}
          {user && <Link to="/profile" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Profile</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors">Admin</Link>}
          
          {/* Desktop Auth Buttons */}
          {!user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors text-sm"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors text-sm"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-gray-600 text-sm font-medium">{user.fullName}</span>
              <button 
                onClick={logout} 
                className="px-4 py-2 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button 
          aria-label="Toggle menu" 
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          onClick={() => setOpen(v => !v)}
        >
        <svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  strokeWidth="2"
  stroke="currentColor"
  className="h-5 w-5"
>
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
</svg>

        </button>
      </nav>

      {/* Mobile menu drawer */}
      <div className={`md:hidden border-t bg-white border-gray-200 ${open ? 'block' : 'hidden'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/artisans" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Artisans</Link>
            {/* <Link to="/search" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Search</Link> */}
            <Link to="/jobs" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Jobs</Link>
            {user && <Link to="/bookings" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Bookings</Link>}
            {user && <Link to="/profile" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Profile</Link>}
            {user?.role === 'admin' && <Link to="/admin" onClick={close} className="py-2 px-3 text-gray-700 hover:text-[#1f4f9c] font-medium transition-colors rounded-lg hover:bg-gray-50">Admin</Link>}
            
            {!user ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link 
                  to="/login" 
                  onClick={close}
                  className="py-3 px-4 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors text-center"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={close}
                  className="py-3 px-4 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium">{user.fullName}</span>
                </div>
                <button 
                  onClick={() => { logout(); close() }} 
                  className="py-3 px-4 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors text-center"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<BrowserRouter>
					<div className="min-h-screen bg-gray-50 text-gray-900">
						<Header />
						<main className="container-narrow py-6">
							<Routes>
								<Route path="/" element={<HomePage />} />
								<Route path="/artisans" element={<ArtisansPage />} />
                <Route path="/artisans/:id" element={<ArtisanDetailPage />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
								<Route path="/login" element={<LoginPage />} />
								<Route path="/register" element={<RegisterPage />} />
								{/* <Route path="/search" element={<SearchPage />} /> */}
								<Route path="/jobs" element={<JobsPage />} />
								<Route path="/bookings" element={<Protected roles={["user","artisan","admin"]}><BookingPage /></Protected>} />
								<Route path="/profile" element={<Protected roles={["artisan","admin","user"]}><ProfilePage /></Protected>} />
								<Route path="/admin" element={<Protected roles={["admin"]}><AdminPage /></Protected>} />
							</Routes>
						</main>
					</div>
				</BrowserRouter>
			</AuthProvider>
		</QueryClientProvider>
	)
}

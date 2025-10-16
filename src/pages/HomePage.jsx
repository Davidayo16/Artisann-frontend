import { Link } from 'react-router-dom'

const BRAND_COLOR = '#1f4f9c'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Content */}
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Hire trusted Nigerian artisans. 
              <span className="text-[#1f4f9c]"> Fast, safe, reliable.</span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Find plumbers, electricians, carpenters and more. 
              Post jobs, compare bids, pay securely, rate your experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/artisans"
                className="px-6 py-3 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors w-full sm:w-auto text-center"
              >
                Find Artisans
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors w-full sm:w-auto text-center"
              >
                Join Marketplace
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Artisan working" 
              className="w-full h-64 md:h-80 rounded-lg object-cover shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why choose Artisan Market?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Trusted by thousands of Nigerians for home services
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-[#1f4f9c] rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl text-white">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600 text-sm">
                Filter by trade, location and rating to find the right pro.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-[#1f4f9c] rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl text-white">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Paystack-powered NGN card and USSD payments.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-[#1f4f9c] rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl text-white">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Reviews</h3>
              <p className="text-gray-600 text-sm">
                5-star ratings and feedback from real clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-[#1f4f9c]">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8 text-center">
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold mb-1">10K+</div>
            <p className="text-sm">Happy Clients</p>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold mb-1">5K+</div>
            <p className="text-sm">Artisans</p>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold mb-1">₦500M+</div>
            <p className="text-sm">Completed</p>
          </div>
          <div className="text-white">
            <div className="text-2xl md:text-3xl font-bold mb-1">4.9⭐</div>
            <p className="text-sm">Rating</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <img 
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
            alt="Happy customers" 
            className="w-full h-48 md:h-64 object-cover rounded-lg shadow-md mx-auto"
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600">
            Join Nigeria's largest artisan marketplace today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="px-6 py-3 bg-[#1f4f9c] text-white rounded-lg font-medium hover:bg-[#1a4689] transition-colors w-full sm:w-auto"
            >
              Start Searching
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border-2 border-[#1f4f9c] text-[#1f4f9c] rounded-lg font-medium hover:bg-[#1f4f9c] hover:text-white transition-colors w-full sm:w-auto"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
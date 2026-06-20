"use client"
import React, { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const providers = [
  {
    id: 'google',
    label: 'Continue with Google',
    icon: (
      <svg className="h-5 w-5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 0 48 48">
        <g fill="none" fillRule="evenodd">
          <path d="M9.827 24c0-1.524.253-2.985.705-4.356L2.623 13.604C1.082 16.734.214 20.26.214 24c0 3.737.867 7.261 2.41 10.388l7.904-6.051A14.17 14.17 0 0 1 9.827 24" fill="#FBBC05" />
          <path d="M23.714 10.133c3.311 0 6.302 1.174 8.652 3.094L39.202 6.4C35.036 2.773 29.695.533 23.714.533 14.427.533 6.445 5.844 2.623 13.604l7.909 6.04c1.822-5.532 7.017-9.511 13.182-9.511" fill="#EB4335" />
          <path d="M23.714 37.867c-6.165 0-11.36-3.979-13.182-9.511l-7.909 6.039C6.445 42.156 14.427 47.467 23.714 47.467c5.732 0 11.204-2.035 15.311-5.849l-7.507-5.804c-2.118 1.334-4.785 2.053-7.804 2.053" fill="#34A853" />
          <path d="M46.145 24c0-1.387-.213-2.877-.533-4.267H23.714v9.067h12.604c-.63 3.091-2.346 5.468-4.8 7.014l7.507 5.804C43.339 37.614 46.145 31.649 46.145 24" fill="#4285F4" />
        </g>
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    icon: (
      <svg className="h-5 w-5 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 73 73">
        <g fill="none" fillRule="evenodd">
          <rect stroke="#000" strokeWidth="2" fill="#000" x="1" y="1" width="71" height="71" rx="14" />
          <path d="M58.307 21.428a34.9 34.9 0 0 0-12.744-12.745C41.432 6.272 37.897 5 34.962 5 32.027 5 28.491 6.272 24.36 8.683A34.9 34.9 0 0 0 11.616 21.428C9.205 25.559 8 29.07 8 32.96c0 5.875 1.714 11.158 5.143 15.85 3.429 4.693 7.858 7.94 13.288 9.742.632.117 1.1.035 1.404-.245.304-.28.456-.632.456-1.052 0-.07-.006-.703-.018-1.897a44.46 44.46 0 0 1-.018-1.87l-.807.14c-.515.093-1.165.133-1.95.122-.783-.011-1.597-.093-2.439-.245-.843-.152-1.627-.503-2.353-1.053-.725-.55-1.24-1.27-1.544-2.159l-.35-.807a8.785 8.785 0 0 0-1.107-1.792c-.503-.657-.994-1.101-1.509-1.334l-.245-.176a2.6 2.6 0 0 1-.456-.42 1.84 1.84 0 0 1-.315-.49c-.07-.163-.012-.298.175-.403.187-.105.526-.158.966-.158l.702.105c.468.094 1.047.374 1.738.843.69.468 1.257 1.077 1.702 1.825.539.96 1.188 1.691 1.95 2.194.76.503 1.527.755 2.299.755.772 0 1.439-.058 2.001-.175.562-.117 1.089-.293 1.58-.526.21-1.569.784-2.774 1.72-3.616-1.334-.14-2.533-.351-3.598-.633a14.29 14.29 0 0 1-3.493-1.44 9.7 9.7 0 0 1-3-2.527c-.749-.937-1.363-2.166-1.843-3.687-.479-1.521-.718-3.276-.718-5.266 0-2.832.925-5.242 2.774-7.232-.866-2.129-.784-4.516.245-7.16.679-.211 1.686-.053 3.02.472 1.334.526 2.31.977 2.93 1.351.621.375 1.118.692 1.493.95a26.54 26.54 0 0 1 11.246 0l1.335-.857c.912-.562 1.989-1.077 3.229-1.545 1.24-.468 2.189-.597 2.844-.386 1.053 2.645 1.147 5.032.281 7.161 1.849 1.99 2.774 4.4 2.774 7.232 0 1.99-.239 3.751-.718 5.284-.48 1.533-1.1 2.76-1.86 3.685-.761.925-1.713 1.703-2.848 2.334-1.135.632-2.236 1.088-3.3 1.369-1.065.281-2.265.492-3.599.633 1.217 1.053 1.826 2.714 1.826 4.984v7.407c0 .421.146.772.439 1.053.292.281.754.363 1.386.246 5.43-1.802 9.859-5.05 13.287-9.742C60.286 44.118 62 38.834 62 32.96c0-3.89-1.205-7.4-3.616-11.532H58.307z" fill="#FFF" />
        </g>
      </svg>
    ),
  },
]

const Login = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [loadingProvider, setLoadingProvider] = useState(null)

  useEffect(() => {
    document.title = 'Login — Get Me A Coffee'
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleSignIn = async (providerId) => {
    setLoadingProvider(providerId)
    try {
      await signIn(providerId)
    } catch (error) {
      console.error(`Error signing in with ${providerId}:`, error)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 py-12">
      {/* Card */}
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center gap-4 justify-center">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
              Get Me A Chai
            </h1>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <Image src="/tea.gif" width={48} height={48} className="invertImg w-12 h-12" alt="Tea cup" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm">
            Sign in to <span className="text-purple-400 font-semibold">Get Me A Chai</span> and start receiving support
          </p>
        </div>

        {/* Glassmorphism card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-center text-white text-sm font-medium mb-6 uppercase tracking-widest opacity-60">
            Choose a sign-in method
          </h2>

          <div className="flex flex-col gap-3">
            {providers.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => handleSignIn(id)}
                disabled={loadingProvider !== null}
                className="flex items-center w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label={label}
              >
                {loadingProvider === id ? (
                  <svg className="h-5 w-5 mr-3 animate-spin text-purple-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : icon}
                <span className="flex-1 text-center sm:text-left truncate">
                  {loadingProvider === id ? `Connecting…` : label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-slate-500 leading-relaxed">
              By signing in, you agree to our{' '}
              <span className="text-purple-400 hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-purple-400 hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          🔒 Your credentials are never stored by us
        </p>
      </div>
    </div>
  )
}

export default Login
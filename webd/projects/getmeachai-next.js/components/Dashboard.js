"use client"
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Dashboard = () => {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [form, setform] = useState({
        name: '',
        email: '',
        username: '',
        profilepic: '',
        coverpic: '',
        razorpayid: '',
        razorpaysecret: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            let u = await fetchuser(session.user.name)
            if (u) {
                setform({
                    name: u.name || '',
                    email: u.email || '',
                    username: u.username || '',
                    profilepic: u.profilepic || '',
                    coverpic: u.coverpic || '',
                    razorpayid: u.razorpayid || '',
                    razorpaysecret: u.razorpaysecret || '',
                })
            }
        } catch (err) {
            console.error('Failed to fetch user data:', err)
            toast.error('Failed to load profile data.')
        } finally {
            setLoading(false)
        }
    }, [session])

    useEffect(() => {
        if (session === undefined) return  // still loading

        if (!session) {
            router.push('/login')
        } else {
            getData()
        }
    }, [session, router, getData])

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Client-side validations
        if (!form.name || form.name.trim().length < 2) {
            toast.error("Display name must be at least 2 characters long")
            return
        }
        if (!form.username || form.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return
        }
        if (form.razorpayid && !form.razorpayid.startsWith('rzp_test_')) {
            toast.error("Razorpay Key ID must start with 'rzp_test_'")
            return
        }

        setSaving(true)
        try {
            // Pass the form state object directly — reliable in React 19 with controlled inputs
            const oldUsername = session.user.name
            let result = await updateProfile(form, oldUsername)

            if (result?.error) {
                toast.error(result.error)
                return
            }

            // Refresh the session so Navbar/links update to new username
            await update()

            toast.success('✅ Profile updated! Redirecting to your page…')

            // Redirect to the user's public profile page after a short delay
            setTimeout(() => {
                router.push(`/${form.username}`)
            }, 1500)
        } catch (err) {
            console.error('Error updating profile:', err)
            toast.error('An unexpected error occurred. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            {/* ToastContainer is always rendered (not inside loading conditional) */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white text-center">
                        <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <p className="text-slate-400">Loading your profile…</p>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto py-10 px-4 max-w-2xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
                        <p className="text-slate-400 text-sm">Manage your profile and payment settings</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <form className="space-y-5" onSubmit={handleSubmit}>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block mb-1.5 text-sm font-medium text-slate-300">
                                    Display Name
                                </label>
                                <input
                                    value={form.name}
                                    onChange={handleChange}
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Your full name"
                                    className="block w-full p-3 text-white bg-slate-800 border border-white/10 rounded-xl text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-slate-300">
                                    Email
                                </label>
                                <input
                                    value={form.email}
                                    onChange={handleChange}
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="your@email.com"
                                    readOnly
                                    className="block w-full p-3 text-slate-400 bg-slate-800/50 border border-white/10 rounded-xl text-sm placeholder-slate-500 cursor-not-allowed focus:outline-none"
                                />
                                <p className="text-xs text-slate-500 mt-1">Email is linked to your OAuth account and cannot be changed.</p>
                            </div>

                            {/* Username */}
                            <div>
                                <label htmlFor="username" className="block mb-1.5 text-sm font-medium text-slate-300">
                                    Username <span className="text-slate-500 text-xs">(used in your profile URL)</span>
                                </label>
                                <div className="flex items-center bg-slate-800 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition">
                                    <span className="pl-3 text-slate-500 text-sm select-none">getmeachai.com/</span>
                                    <input
                                        value={form.username}
                                        onChange={handleChange}
                                        type="text"
                                        name="username"
                                        id="username"
                                        placeholder="yourname"
                                        className="flex-1 p-3 text-white bg-transparent text-sm placeholder-slate-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Profile Picture */}
                            <div>
                                <label htmlFor="profilepic" className="block mb-1.5 text-sm font-medium text-slate-300">
                                    Profile Picture URL
                                </label>
                                <input
                                    value={form.profilepic}
                                    onChange={handleChange}
                                    type="text"
                                    name="profilepic"
                                    id="profilepic"
                                    placeholder="https://example.com/your-photo.jpg"
                                    className="block w-full p-3 text-white bg-slate-800 border border-white/10 rounded-xl text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition"
                                />
                                {form.profilepic && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <Image unoptimized src={form.profilepic} width={40} height={40} alt="Profile preview" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                                        <span className="text-xs text-slate-500">Preview</span>
                                    </div>
                                )}
                            </div>

                            {/* Cover Picture */}
                            <div>
                                <label htmlFor="coverpic" className="block mb-1.5 text-sm font-medium text-slate-300">
                                    Cover Picture URL
                                </label>
                                <input
                                    value={form.coverpic}
                                    onChange={handleChange}
                                    type="text"
                                    name="coverpic"
                                    id="coverpic"
                                    placeholder="https://example.com/your-cover.jpg"
                                    className="block w-full p-3 text-white bg-slate-800 border border-white/10 rounded-xl text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition"
                                />
                            </div>

                            {/* Razorpay Section */}
                            <div className="pt-4 border-t border-white/10">
                                <h2 className="text-sm font-semibold text-slate-300 mb-1">💳 Razorpay Settings</h2>
                                <p className="text-xs text-slate-500 mb-4">
                                    Add your <strong className="text-slate-400">Test Mode</strong> Razorpay API keys to enable payments on your page.
                                    Get them at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">dashboard.razorpay.com</a> → Settings → API Keys.
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="razorpayid" className="block mb-1.5 text-sm font-medium text-slate-300">
                                            Razorpay Key ID <span className="text-slate-500 text-xs">(starts with rzp_test_)</span>
                                        </label>
                                        <input
                                            value={form.razorpayid}
                                            onChange={handleChange}
                                            type="text"
                                            name="razorpayid"
                                            id="razorpayid"
                                            placeholder="rzp_test_xxxxxxxxxxxx"
                                            className="block w-full p-3 text-white bg-slate-800 border border-white/10 rounded-xl text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="razorpaysecret" className="block mb-1.5 text-sm font-medium text-slate-300">
                                            Razorpay Key Secret
                                        </label>
                                        <input
                                            value={form.razorpaysecret}
                                            onChange={handleChange}
                                            type="password"
                                            name="razorpaysecret"
                                            id="razorpaysecret"
                                            placeholder="Your Razorpay secret key"
                                            className="block w-full p-3 text-white bg-slate-800 border border-white/10 rounded-xl text-sm placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-3 px-6 text-white font-semibold bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 focus:ring-4 focus:ring-purple-500/30 focus:outline-none rounded-xl text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Saving…
                                        </span>
                                    ) : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard

"use client"
import React, { useEffect, useState, useCallback } from 'react'
import Script from 'next/script'
import Image from 'next/image'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Bounce } from 'react-toastify'
import { useRouter } from 'next/navigation'

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
    const [currentUser, setcurrentUser] = useState(null)
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    const getData = useCallback(async () => {
        setLoading(true)
        try {
            let u = await fetchuser(username)
            setcurrentUser(u)
            let dbpayments = await fetchpayments(username)
            setPayments(dbpayments)
        } catch (err) {
            console.error("Failed to load page data:", err)
        } finally {
            setLoading(false)
        }
    }, [username])

    // Load user data and payments on mount only
    useEffect(() => {
        getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Show toast if returning from a successful payment
    useEffect(() => {
        if (searchParams.get("paymentdone") === "true") {
            toast('🎉 Thanks for your donation!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
                transition: Bounce,
            })
            // Clean the URL so the toast doesn't re-appear on refresh
            router.replace(`/${username}`)
        }
    }, [searchParams, router, username])

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    const pay = async (amount) => {
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount")
            return
        }

        setPaying(true)
        try {
            let result = await initiate(amount, username, paymentform)

            // Handle error returned from server action
            if (result.error) {
                toast.error(result.error, { theme: "dark" })
                setPaying(false)
                return
            }

            let orderId = result.id
            var options = {
                key: currentUser.razorpayid,
                amount: amount,
                currency: "INR",
                name: "Get Me A Chai",
                description: "Support the creator",
                image: currentUser.profilepic || "/tea.gif",
                order_id: orderId,
                callback_url: `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
                prefill: {
                    name: paymentform.name,
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#7c3aed",
                },
            }

            var rzp1 = new Razorpay(options)
            rzp1.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error.description}`, { theme: "dark" })
                setPaying(false)
            })
            rzp1.open()
            setPaying(false)
        } catch (err) {
            console.error("Payment error:", err)
            toast.error("Something went wrong. Please try again.", { theme: "dark" })
            setPaying(false)
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="w-full h-48 md:h-[350px] bg-slate-800" />
                <div className="flex justify-center mt-[-40px] mb-20">
                    <div className="rounded-full bg-slate-700 size-36" />
                </div>
                <div className="flex flex-col items-center gap-3 mb-10">
                    <div className="h-5 w-32 bg-slate-700 rounded" />
                    <div className="h-4 w-48 bg-slate-800 rounded" />
                </div>
            </div>
        )
    }

    // Creator not found
    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <p className="text-6xl mb-4">😕</p>
                <h2 className="text-2xl font-bold mb-2">Creator not found</h2>
                <p className="text-slate-400">The user <strong>@{username}</strong> does not exist on this platform.</p>
            </div>
        )
    }

    const hasRazorpayKeys = currentUser.razorpayid && currentUser.razorpaysecret
    const totalRaised = payments.reduce((a, b) => a + b.amount, 0)
    const isFormValid = paymentform.name?.length >= 3 && paymentform.message?.length >= 4 && paymentform.amount?.length >= 1

    return (
        <>
            {/* Single ToastContainer — only one needed */}
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

            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            {/* Cover image */}
            <div className="cover w-full relative">
                <Image
                    className="object-cover w-full h-48 md:h-[350px] shadow-blue-700 shadow-sm"
                    src={currentUser.coverpic || '/default-cover.jpg'}
                    alt="Cover"
                    width={1920}
                    height={350}
                    priority
                />
                {/* Profile picture */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 border-white/20 border-4 overflow-hidden rounded-full size-32 shadow-xl shadow-black/50">
                    <Image
                        className="rounded-full object-cover size-32"
                        width={128}
                        height={128}
                        src={currentUser.profilepic || '/default-avatar.png'}
                        alt={`${username}'s profile`}
                    />
                </div>
            </div>

            {/* Creator info */}
            <div className="info flex justify-center items-center mt-20 mb-8 flex-col gap-2 px-4">
                <div className="font-bold text-xl text-white">@{username}</div>
                <div className="text-slate-400 text-sm text-center">
                    {currentUser.name ? `${currentUser.name} — ` : ''}Let&apos;s help {username} get a chai! ☕
                </div>
                <div className="flex gap-4 mt-1">
                    <span className="text-slate-500 text-sm">
                        <span className="text-white font-semibold">{payments.length}</span> supporters
                    </span>
                    <span className="text-slate-500 text-sm">
                        <span className="text-white font-semibold">₹{totalRaised.toLocaleString('en-IN')}</span> raised
                    </span>
                </div>
            </div>

            {/* Payment section */}
            <div className="payment flex gap-4 w-full max-w-5xl mx-auto mb-16 flex-col md:flex-row px-4">
                {/* Supporters leaderboard */}
                <div className="supporters w-full md:w-1/2 bg-slate-900/80 border border-white/10 rounded-2xl text-white px-5 py-8">
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                        🏆 Top 10 Supporters
                    </h2>
                    <ul className="space-y-4">
                        {payments.length === 0 ? (
                            <li className="text-slate-500 text-sm text-center py-4">
                                No payments yet. Be the first to support! ☕
                            </li>
                        ) : (
                            payments.map((p, i) => (
                                <li key={i} className="flex gap-3 items-start">
                                    <Image width={36} height={36} src="/avatar.gif" alt="user avatar" className="rounded-full flex-shrink-0" />
                                    <div className="text-sm">
                                        <span className="font-semibold text-white">{p.name}</span>
                                        {' '}donated{' '}
                                        <span className="font-bold text-purple-400">₹{p.amount}</span>
                                        {p.message && (
                                            <span className="text-slate-400"> — &quot;{p.message}&quot;</span>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Make a payment */}
                <div className="makePayment w-full md:w-1/2 bg-slate-900/80 border border-white/10 rounded-2xl text-white px-5 py-8">
                    <h2 className="text-xl font-bold mb-5">☕ Buy a Chai</h2>

                    {!hasRazorpayKeys ? (
                        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-4 text-sm text-yellow-300">
                            ⚠️ <strong>@{username}</strong> hasn&apos;t set up their payment details yet.
                            Ask them to add their Razorpay Test API keys in their Dashboard.
                        </div>
                    ) : (
                        <div className="flex gap-3 flex-col">
                            <input
                                onChange={handleChange}
                                value={paymentform.name}
                                name="name"
                                type="text"
                                className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Your name (min. 3 chars)"
                            />
                            <input
                                onChange={handleChange}
                                value={paymentform.message}
                                name="message"
                                type="text"
                                className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Your message (min. 4 chars)"
                            />
                            <input
                                onChange={handleChange}
                                value={paymentform.amount}
                                name="amount"
                                type="number"
                                min="1"
                                className="w-full p-3 rounded-xl bg-slate-800 border border-white/10 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Amount in ₹ (e.g. 10, 50, 100)"
                            />

                            <button
                                onClick={() => pay(Number.parseInt(paymentform.amount) * 100)}
                                type="button"
                                disabled={!isFormValid || paying}
                                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-3 text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-600 disabled:to-slate-600"
                            >
                                {paying ? 'Processing…' : '☕ Pay Now'}
                            </button>

                            {/* Quick amount buttons */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[10, 20, 50, 100, 500].map((amt) => (
                                    <button
                                        key={amt}
                                        className="bg-slate-800 hover:bg-slate-700 border border-white/10 px-3 py-2 rounded-lg text-sm transition-colors"
                                        onClick={() => {
                                            setPaymentform(prev => ({ ...prev, amount: String(amt) }))
                                        }}
                                    >
                                        ₹{amt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default PaymentPage

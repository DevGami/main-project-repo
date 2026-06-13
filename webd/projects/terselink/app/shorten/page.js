"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Copy, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react'

const Shorten = () => {
    const [url, setUrl] = useState("")
    const [shorturl, setShorturl] = useState("")
    const [generated, setGenerated] = useState(null)
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const copyToClipboard = async () => {
        if (!generated?.shortUrl) return
        try {
            await navigator.clipboard.writeText(generated.shortUrl)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    const generate = async (event) => {
        event.preventDefault()
        setGenerated(null)
        setMessage("")
        setIsCopied(false)
        setIsSubmitting(true)

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url, shorturl }),
            })

            const result = await response.json()
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to create the short link.")
            }

            setGenerated(result.data)
            setMessage(result.message)
            setUrl("")
            setShorturl("")
        } catch (error) {
            setMessage(error.message || "Unable to create the short link.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden pt-20 px-4 sm:px-6 lg:px-8">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[20%] w-72 h-72 rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[80px] animate-blob" />
                <div className="absolute bottom-[20%] left-[10%] w-72 h-72 rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className='w-full max-w-lg bg-white/70 backdrop-blur-xl shadow-2xl shadow-purple-500/10 rounded-3xl p-8 sm:p-10 flex flex-col gap-8 border border-white relative z-10'
            >
                <div className="text-center">
                    <div className="mx-auto bg-gradient-to-tr from-purple-100 to-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                        <Link2 size={32} className="text-purple-600" />
                    </div>
                    <h1 className='font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight'>Shorten a link</h1>
                    <p className="text-slate-500 mt-3 text-lg">Paste your long URL below to create a TerseLink.</p>
                </div>
                
                <form className='flex flex-col gap-5' onSubmit={generate} noValidate>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="destination-url">
                            Destination URL <span className="text-purple-500" aria-hidden="true">*</span>
                        </label>
                        <input
                            id="destination-url"
                            type="url"
                            value={url}
                            className='w-full px-5 py-4 bg-white/50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none rounded-2xl transition-all font-medium text-slate-700 placeholder:text-slate-400'
                            placeholder='https://example.com/very-long-link...'
                            required
                            maxLength={2048}
                            onChange={event => setUrl(event.target.value)}
                            aria-required="true"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="custom-alias">
                            Custom alias <span className="text-slate-400 font-normal ml-1">(optional)</span>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-5 text-slate-400 font-bold pointer-events-none">/</span>
                            <input
                                id="custom-alias"
                                type="text"
                                value={shorturl}
                                className='w-full pl-10 pr-5 py-4 bg-white/50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none rounded-2xl transition-all font-medium text-slate-700 placeholder:text-slate-400'
                                placeholder='my-custom-link'
                                minLength={3}
                                maxLength={48}
                                pattern="[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?"
                                onChange={event => setShorturl(event.target.value)}
                            />
                        </div>
                    </div>
                    
                    <motion.button
                        whileHover={{ scale: url ? 1.02 : 1 }}
                        whileTap={{ scale: url ? 0.98 : 1 }}
                        type="submit"
                        disabled={isSubmitting || !url}
                        className='mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all rounded-2xl shadow-lg shadow-purple-500/30 disabled:shadow-none py-4 font-bold text-white flex justify-center items-center gap-2 text-lg'
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <Sparkles size={20} />
                                Generate Link
                            </>
                        )}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {message && !generated && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm font-medium text-red-500 flex items-center justify-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100"
                        >
                            <AlertCircle size={16} />
                            {message}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence>
                    {generated && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mt-2 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex flex-col gap-4 shadow-inner"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-green-500" size={20} />
                                <span className='text-sm font-bold text-slate-800'>Your short link is ready!</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <a 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    href={generated.shortUrl}
                                    className="flex-1 bg-white border border-purple-200 text-purple-700 font-semibold text-sm sm:text-base p-4 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap hover:text-purple-900 transition-colors shadow-sm"
                                >
                                    {generated.shortUrl}
                                </a>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={copyToClipboard}
                                    aria-label="Copy to clipboard"
                                    className={`p-4 rounded-xl transition-all shadow-sm flex-shrink-0 ${isCopied ? 'bg-green-500 text-white border-green-500' : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'}`}
                                    title="Copy to clipboard"
                                >
                                    {isCopied ? <CheckCircle2 size={24} /> : <Copy size={24} />}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </main>
    )
}

export default Shorten

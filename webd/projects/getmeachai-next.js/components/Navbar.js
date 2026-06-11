"use client"
import React, { useState } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  const { data: session } = useSession()
  const [showdropdown, setShowdropdown] = useState(false)


  return (
    <nav className='bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10 shadow-lg text-white flex justify-between items-center px-6 md:px-10 h-20 transition-all'>
      <Link className="logo font-bold text-lg flex justify-center items-center gap-3 transition-transform hover:scale-105" href={"/"}>
        <Image className='invertImg' src="/tea.gif" width={44} height={44} alt="GetMeAChai Logo" />
        <span className='text-2xl tracking-tight hidden sm:block'>Get Me a Chai</span>
      </Link>

      {/* <ul className='flex justify-between gap-4'>
        <li>Home</li>
        <li>About</li>
        <li>Projects</li>
        <li>Sign Up</li>
        <li>Login</li>
      </ul> */}

      <div className='relative flex items-center gap-4'>
        {session ? (
          <>
            <button 
              onClick={() => setShowdropdown(!showdropdown)} 
              onBlur={() => setTimeout(() => setShowdropdown(false), 150)} 
              id="dropdownDefaultButton" 
              className="text-white bg-slate-800 hover:bg-slate-700 border border-white/10 focus:ring-2 focus:outline-none focus:ring-purple-500 font-medium rounded-xl text-sm px-4 py-2.5 text-center inline-flex items-center transition-all shadow-sm" 
              type="button"
            >
              Account
              <svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div id="dropdown" className={`z-10 ${showdropdown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"} transition-all duration-200 absolute right-0 top-14 bg-slate-800 border border-white/10 rounded-xl shadow-2xl w-44 overflow-hidden`}>
              <ul className="py-2 text-sm text-gray-200" aria-labelledby="dropdownDefaultButton">
                <li>
                  <Link href="/dashboard" className="block px-4 py-2 hover:bg-slate-700 hover:text-white transition-colors">Dashboard</Link>
                </li>
                <li>
                  <Link href={`/${session.user.name}`} className="block px-4 py-2 hover:bg-slate-700 hover:text-white transition-colors">Your Page</Link>
                </li>
                <li>
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className="block w-full text-left px-4 py-2 hover:bg-slate-700 hover:text-red-400 transition-colors">Sign out</button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <Link href={"/login"}>
            <button className='text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-500/50 font-medium rounded-xl text-sm px-6 py-2.5 text-center transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5'>
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar

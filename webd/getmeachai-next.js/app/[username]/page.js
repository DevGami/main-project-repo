import React from 'react'
import PaymentPage from '@/components/PaymentPage'
import { notFound } from "next/navigation"
import connectDb from '@/db/connectDb'
import User from '@/models/User'

const Username = async ({ params }) => {
  // Next.js 15+: params is a Promise — must be awaited
  const { username } = await params

  await connectDb()
  const user = await User.findOne({ username })
  if (!user) {
    return notFound()
  }

  return (
    <>
      <PaymentPage username={username} />
    </>
  )
}

export default Username

export async function generateMetadata({ params }) {
  const { username } = await params
  return {
    title: `Support ${username} - Get Me A Chai`,
  }
}

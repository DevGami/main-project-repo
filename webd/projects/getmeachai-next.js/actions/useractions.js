"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"


export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()

    // Fetch the creator who is receiving the payment
    let user = await User.findOne({ username: to_username })
    if (!user) {
        return { error: "Creator not found" }
    }

    // Guard: creator must have configured Razorpay credentials in their dashboard
    if (!user.razorpayid || !user.razorpaysecret) {
        return {
            error: "This creator has not set up their payment details yet. Ask them to add their Razorpay Test API keys in their Dashboard.",
        }
    }

    const secret = user.razorpaysecret
    var instance = new Razorpay({ key_id: user.razorpayid, key_secret: secret })

    let options = {
        amount: Number.parseInt(amount),  // amount in paise (100 paise = ₹1)
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    // Record a pending payment in the database
    await Payment.create({
        oid: x.id,
        amount: amount / 100,
        to_user: to_username,
        name: paymentform.name,
        message: paymentform.message,
    })

    return x
}


export const fetchuser = async (username) => {
    await connectDb()
    let u = await User.findOne({ username: username }).lean()
    if (!u) return null
    // Deep-serialize to strip MongoDB ObjectId/Date instances — required for Next.js Client Components
    return JSON.parse(JSON.stringify(u))
}

export const fetchpayments = async (username) => {
    await connectDb()
    // Find all completed payments, sorted by amount descending, limit 10
    let p = await Payment.find({ to_user: username, done: true })
        .sort({ amount: -1 })
        .limit(10)
        .lean()
    // Deep-serialize to strip MongoDB ObjectId/Date instances — required for Next.js Client Components
    return JSON.parse(JSON.stringify(p))
}

export const updateProfile = async (data, oldusername) => {
    await connectDb()

    // Accept either a plain object (from React state) or FormData
    let ndata = data instanceof FormData ? Object.fromEntries(data) : data

    // Sanitize: only allow known fields to prevent injection
    const allowedFields = ['name', 'email', 'username', 'profilepic', 'coverpic', 'razorpayid', 'razorpaysecret']
    const updateData = {}
    for (const key of allowedFields) {
        if (ndata[key] !== undefined) {
            updateData[key] = ndata[key]
        }
    }
    updateData.updatedAt = new Date()

    if (!updateData.email) {
        return { error: "Email is required to update profile." }
    }

    // If username is changing, ensure the new username is not already taken
    if (oldusername !== updateData.username) {
        let existing = await User.findOne({ username: updateData.username })
        if (existing) {
            return { error: "Username already taken. Please choose a different one." }
        }
        await User.updateOne({ email: updateData.email }, { $set: updateData })
        // Cascade: update all payment records pointing to old username
        await Payment.updateMany({ to_user: oldusername }, { $set: { to_user: updateData.username } })
    } else {
        await User.updateOne({ email: updateData.email }, { $set: updateData })
    }

    return { success: true }
}

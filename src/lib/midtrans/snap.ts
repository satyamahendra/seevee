import Midtrans from "midtrans-client"

export const snap = new Midtrans.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION?.toLowerCase() === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
})

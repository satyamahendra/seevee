// Product prices are stored in US cents; Midtrans only charges IDR, so checkout converts.
export const formatUsd = (cents: number) => (cents / 100).toLocaleString("en-US", {style: "currency", currency: "USD"})

export const formatIdr = (idr: number) => idr.toLocaleString("id-ID", {style: "currency", currency: "IDR", maximumFractionDigits: 0})

// shortcut: fixed rate from env, switch to a live FX feed if rate drift matters
// Null when unset, so display pages can hide it instead of crashing; checkout throws.
export function usdToIdrRate() {
    const rate = Number(process.env.USD_TO_IDR)
    return Number.isFinite(rate) && rate > 0 ? rate : null
}

// shortcut: orders store IDR only, so USD is re-derived at the current rate; store usd_cents on Order if the rate ever changes
export function idrToUsdCents(idr: number) {
    const rate = usdToIdrRate()
    return rate ? Math.round((idr / rate) * 100) : null
}

export function usdCentsToIdr(cents: number) {
    const rate = usdToIdrRate()
    if (!rate) throw new Error("USD_TO_IDR is not configured")
    return Math.ceil((cents / 100) * rate)
}

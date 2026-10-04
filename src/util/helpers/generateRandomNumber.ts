export function generateRandomNumber() {
    const timestamp = Date.now()
    const performanceTime = Math.floor(performance.now() * 1000000)
    const randomComponent = Math.floor(Math.random() * 1e9)
    return BigInt(`${timestamp}${performanceTime}${randomComponent}`).toString()
}

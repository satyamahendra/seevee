export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number) {
    if (originalPrice <= 0 || discountedPrice < 0 || discountedPrice > originalPrice) {
        return 0
    }

    const discount = originalPrice - discountedPrice
    return ((discount / originalPrice) * 100).toFixed(0)
}

export function convertIdrToUsd(idrAmount: number, rate: number = 16000): number {
    return idrAmount / rate
}

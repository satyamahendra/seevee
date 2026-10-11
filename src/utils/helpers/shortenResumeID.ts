import {parse as uuidParse, stringify as uuidStringify} from "uuid"
import baseX from "base-x"

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const base62 = baseX(BASE62)

// Encode UUID → short
export function uuidToShort(uuid: string): string {
    const bytes = uuidParse(uuid) // 16-byte array
    return base62.encode(Buffer.from(bytes))
}

// Decode short → UUID
export function shortToUuid(shortId: string): string {
    const bytes = base62.decode(shortId)
    const uuid = uuidStringify(bytes)
    return uuid
}

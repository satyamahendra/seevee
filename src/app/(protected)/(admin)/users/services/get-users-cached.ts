import {cache} from "react"
import {getUsers} from "./get-users"

// Same args within one request share a single query, so the list and the pagination can each ask without hitting the DB twice.
export const getUsersCached = cache(getUsers)

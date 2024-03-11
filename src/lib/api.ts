import createClient from 'openapi-fetch'
import { type paths } from '@/lib/api/types.d'

const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL
const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.substring(0, apiBaseUrl.length - 1) : apiBaseUrl;

/**
 * Set the base url of the Api
 */
const client = createClient<paths>({ baseUrl })
export default client
const { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE } = client
export { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT, TRACE, baseUrl }

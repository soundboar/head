import type { components } from '@/lib/api/types'

type PlayerEvent = components['schemas']['Event']

class PlayerEvents {
  eventTarget: EventTarget

  constructor(wsUrl: string) {
    this.eventTarget = new EventTarget()

    const ws = new WebSocket(wsUrl)
    ws.onmessage = (e: MessageEvent<PlayerEvent>) => {
      this.eventTarget.dispatchEvent(new CustomEvent<PlayerEvent>(e.data, { detail: e.data }))
      this.eventTarget.dispatchEvent(new CustomEvent<PlayerEvent>('*', { detail: e.data }))
    }
  }

  static create(wsBaseUrl: string | null = null) {
    if (!wsBaseUrl) {
      wsBaseUrl = `${import.meta.env.VITE_API_WEBSOCKET_BASE_URL}events`
    }
    return new PlayerEvents(wsBaseUrl)
  }

  addEventListener(
    type: PlayerEvent | '*',
    callback: (e: CustomEvent<PlayerEvent>) => any,
    options?: AddEventListenerOptions | boolean
  ) {
    this.eventTarget.addEventListener(type, callback as EventListener, options)
  }

  removeEventListener(
    type: PlayerEvent | '*',
    callback: (e: CustomEvent<PlayerEvent>) => any,
    options?: EventListenerOptions | boolean
  ) {
    this.eventTarget.removeEventListener(type, callback as EventListener, options)
  }
}
export default PlayerEvents

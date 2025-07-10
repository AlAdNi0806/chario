export function createReconnectingEventSource(url, options = {}) {
    let eventSource = null
    let reconnectTimeout = null
    let reconnectDelay = 1000
    const maxReconnectDelay = 30000
    const { onOpen, onMessage, onError, onEvent, onStatusChange } = options

    function setStatus(status) {
        if (onStatusChange) onStatusChange(status)
    }

    function connect() {
        setStatus('connecting')
        eventSource = new EventSource(url)

        eventSource.onopen = (event) => {
            reconnectDelay = 1000
            setStatus(1)
            if (onOpen) onOpen(event)
            console.log('SSE connected')
        }

        eventSource.onmessage = (event) => {
            if (onMessage) onMessage(event)
        }

        eventSource.onerror = (event) => {
            if (onError) onError(event)
            setStatus(0)
            console.error('SSE error, attempting to reconnect...')
            eventSource.close()

            if (reconnectTimeout) clearTimeout(reconnectTimeout)

            reconnectTimeout = setTimeout(() => {
                reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay)
                connect()
            }, reconnectDelay)
        }

        if (onEvent && typeof onEvent === 'object') {
            Object.entries(onEvent).forEach(([eventName, handler]) => {
                eventSource.addEventListener(eventName, handler)
            })
        }
    }

    connect()

    return {
        close: () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout)
            if (eventSource) eventSource.close()
            setStatus('disconnected')
            console.log('SSE connection closed manually')
        },
        getEventSource: () => eventSource,
    }
}

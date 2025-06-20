export function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function pad(n) {
    return n < 10 ? '0' + n : n
}
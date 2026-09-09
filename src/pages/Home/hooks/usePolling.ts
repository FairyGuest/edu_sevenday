import { useCallback, useEffect, useRef } from 'react'

export const DEFAULT_POLLING_INTERVAL = 30000

export interface UsePollingOptions {
  interval?: number // 轮询间隔，默认30000毫秒
  enabled?: boolean // 是否开启轮询，默认 true
  immediate?: boolean // 挂载后是否立即执行一次，默认 true
  pauseWhenHidden?: boolean // 页面不可见时暂停轮询，恢复可见时立即拉取一次，默认 true
}

/**
 * 通用轮询 hook
 * @param fetcher 请求函数
 * @returns run 手动触发一次请求
 */
export function usePolling(
  fetcher: () => void | Promise<void>,
  options: UsePollingOptions = {},
) {
  const {
    interval = DEFAULT_POLLING_INTERVAL,
    enabled = true,
    immediate = true,
    pauseWhenHidden = true,
  } = options

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const pendingRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const run = useCallback(async () => {
    if (pendingRef.current) return
    pendingRef.current = true
    try {
      await fetcherRef.current()
    } finally {
      pendingRef.current = false
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    timerRef.current = setInterval(() => {
      run()
    }, interval)
  }, [clearTimer, interval, run])

  useEffect(() => {
    if (!enabled) {
      clearTimer()
      return
    }

    if (immediate) {
      run()
    }
    startTimer()

    return clearTimer
  }, [enabled, immediate, run, startTimer, clearTimer])

  useEffect(() => {
    if (!enabled || !pauseWhenHidden) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimer()
        return
      }
      run()
      startTimer()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, pauseWhenHidden, run, startTimer, clearTimer])

  return { run, refresh: run }
}

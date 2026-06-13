import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useConnectivityStore } from '@/layout/stores/connectivity-store'

export function useConnectivity() {
  const [isOffline, setIsOffline] = useState(false)
  const setOffline = useConnectivityStore((store) => store.setOffline)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    setOffline(isOffline)
  }, [isOffline, setOffline])

  return {
    isOffline,
  }
}

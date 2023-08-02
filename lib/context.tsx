"use client"

import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

// import { useToast } from "@/components/ui/use-toast"

// import { useAuth } from "./auth"

interface IRegionContext {
  region: string | null
  setRegion: (region: string) => void
  
}

const RegionContext = createContext({} as IRegionContext)
export const useRegion = () => useContext(RegionContext)
export function RegionProvider({ children }: PropsWithChildren<{}>) {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  //   const { decodedToken } = useAuth()
  //   const { toast } = useToast()
  
  const setRegion = useCallback(
    (region: string) => {
      const current = new URLSearchParams(params)
      current.set("r", region)
      router.replace(`${pathname}?${current.toString()}`)
    },
    [params, pathname, router]
  )
  useEffect(() => {
    if (pathname.includes("/login")) {
      return
    }
    
    if (!params.get("r")) {
      
      setRegion(params.get("r")??"")
      return
    }

    //   router.push(`${pathname}`)
  }, [ params, pathname, router, setRegion])

  return (
    <RegionContext.Provider
      value={{ region: params.get("r"), setRegion }}
    >
      {children}
    </RegionContext.Provider>
  )
}

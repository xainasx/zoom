

"use client"
import Link from "next/link"
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import ChatBar from "@/components/chatbar"
import { Empty } from "@/components/empty"
import { AlbumArtwork } from "@/components/artentity"
import { getUploads } from "@/lib/apis"
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import UploadsMain from "@/components/uploads_main"

import React from "react"
import { useRegion } from "@/lib/context"



export default function IndexPage() {
  const {region}= useRegion()
  
  const pushtoLogin = ()=>{
    console.log("not logged in")
    window.location.href = "/login"
  }


  React.useEffect(()=>{

    if (region==""){
      pushtoLogin()
    }
  },[])


  return (
  
      
        <div className="hidden md:block">
        {/* <Menu /> */}
        <div className="border-t">
          <div className="bg-background">
            <div className="grid lg:grid-cols-5">
              {/* <Sidebar playlists={playlists} className="hidden lg:block" /> */}
              
              <div className="col-span-3 lg:col-span-4 lg:border-l">    
                <UploadsMain/>
              </div>
              <ChatBar />
            </div>
          </div>
        </div>
      </div>
      
      

      
      
        )
}

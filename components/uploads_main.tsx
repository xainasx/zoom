"use client"
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
  } from "@tanstack/react-query"
import UploadsComps from "./uploads"

export default function UploadsMain(){
    // const queryClient = new QueryClient()
    return(<>
     {/* <QueryClientProvider client={queryClient}> */}
        <UploadsComps/>
      {/* </QueryClientProvider> */}
    </>
    )
}
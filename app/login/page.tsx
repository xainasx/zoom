

import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { UserAuthForm } from "@/components/user-auth"
// import { buttonVariants } from "@/registry/new-york/ui/button"
// import { UserAuthForm } from "@/app/examples/authentication/components/user-auth-form"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default function LoginPage(){
   
  return (
    <>
     
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none  lg:px-0">
{/*       
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
        </div> */}
        <div className="lg:p-1">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter details below to create your account
                </p>
                </div>
            
                <UserAuthForm/>
            
          </div>
        </div>
      </div>
    </>
  )
}






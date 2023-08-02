
"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { login  as loginAPI} from "@/lib/apis"
import { useRegion } from "@/lib/context"
// import { useAuth } from "@/lib/context"


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {

const {region,setRegion} = useRegion()
   

    // const {handleLogin,isAuthenticated} = useAuth()
    
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const [username,setUsername] = React.useState<string>("")
    const [password,setPassword] = React.useState<string>("")

    function loginHandler(){
        loginAPI(username,password).then((res)=>{
        // handleLogin(res.data.access_token)
        
        
        window.location.href = "/"
        }
        ).catch((err)=>{
            console.log(err)
        }
        )

    }


  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
        {/* <h1>{region}</h1> */}
      {/* <form onSubmit={onSubmit}> */}
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Username - 
            </Label>
            <Input
              id="username"
              placeholder="username"
              type="text"
              autoCapitalize="none"
            //   autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              onChange={e=>setUsername(e.target.value)}
            />
            <Input
              id="password"
              placeholder="****"
              type="password"
              autoCapitalize="none"
            //   autoComplete="email"
            //   autoCorrect="off"
              disabled={isLoading}
                onChange={e=>setPassword(e.target.value)}
            />
          </div>
          <Button disabled={isLoading} onClick={e=>loginHandler()}>
            {/* {isLoading && (
              <Icons.gitHub className="mr-2 h-4 w-4 animate-spin" />
            )} */}
            Sign In 
          </Button>
        </div>
      {/* </form> */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        
      </div>
     
    </div>
  )
}
import { getUploads, uploadFile } from "@/lib/apis"
import { UploadItem } from "@/lib/data"
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
  } from "@tanstack/react-query"
import React from "react"
import { AlbumArtwork } from "./artentity"
import { Button } from "./ui/button"
import { Label } from "@radix-ui/react-label"
import { Input } from "./ui/input"
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
  } from "@/components/ui/context-menu"
import { useRegion } from "@/lib/context"
export default function UploadsComps() {
    // const triggersQuery = useQuery({
    //   // queryKey: [region, macSearch, ipSearch, page],
    //   queryKey: [],
    //   queryFn: () => getUploads(),
    //   // enabled: !!region,
    // //   enabled:fasls
    // })

    const [items,setItems] = React.useState<UploadItem[]>([])
    const [refresh,setRefresh] = React.useState<boolean>(false)

    const {region} = useRegion()
    React.useEffect(()=>{

        console.log("Upload")
        getUploads().then((res)=>{
            // setItems(res.data.d)
        var curItems:UploadItem[] = []
            res.data.map((item:UploadItem)=>{
                curItems.push(item)
            })
            setItems(curItems)
        })
    },[refresh])

    const [selectedFile, setSelectedFile] = React.useState();
	const [isFilePicked, setIsFilePicked] = React.useState(false);


    const changeHandler = (event) => {
        console.log(event.target.files[0])
		setSelectedFile(event.target.files[0]);
		// setIsSelected(true);
	};
    const handleSubmission = () => {
        if (selectedFile!=undefined){
            uploadFile(selectedFile).then((res)=>{
                console.log(res)
                setRefresh(!refresh)
                setSelectedFile(undefined)
            }
            ).catch((err)=>{
                console.log(err)
            }
            )
        }

    }
  return <>
  <div className="h-full px-4 py-6 lg:px-8">
   
    <div className="flex items-center justify-between">
      {/* <p className="text-sm text-foreground">

           </p> */}
                 <h2 className="text-2xl font-semibold tracking-tight">
            Welcome to Re deri.gerue
          </h2>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
          <div className="grid w-full max-w-sm items-center gap-1.5">
      {/* <Label htmlFor="picture">pload</Label> */}
      <Input placeholder="upload"  onChange={changeHandler} id="upload"  type="file" />
      <Button onClick={handleSubmission}>upload</Button>

    </div>
          </h2>
          
        </div>
    </div>
    <br/>
       
       <div className="relative">
          <div className="flex space-x-4 pb-4">
            {items.map((item:UploadItem)=>
            <>
            <AlbumArtwork
            key={item.filename}
            album={item}
            className="w-[250px]"
                aspectRatio="portrait"
                width={250}
                height={330}
                refresh={refresh}
                setRefresh={setRefresh}

                />
                </>)
                }
            
              {/* <AlbumArtwork
                key={"name"}
                album={sample}
                className="w-[250px]"
                aspectRatio="portrait"
                width={250}
                height={330}
              /> */}
              
          </div>
      </div>
      
      
    </div>
  </>
  }
  
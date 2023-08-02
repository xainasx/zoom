import Image from "next/image"
import { PlusCircledIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
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

// import { Album } from "../data/albums"
import { UploadItem } from "@/lib/data"
import { deleteUpload } from "@/lib/apis"
// import { playlists } from "../data/playlists"

interface AlbumArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  album: UploadItem
  aspectRatio?: "portrait" | "square"
  width?: number
  height?: number
  refresh?: boolean
  setRefresh?: any
}

const imageLoader = ({ src}:any) => {
    console.log(src)
    return `http://localhost:5001/api/uploads/${src.split("/")[1]}/${src.split("/")[2]}`
  }

export function AlbumArtwork({
  album,
  aspectRatio = "portrait",
  width,
  height,
  className,
  ...props
}: AlbumArtworkProps) {
    
  return (
    <div className={cn("space-y-3", className)} {...props}>
          <div className="overflow-hidden rounded-md">
            <Image
            //  loader={() => "http://localhost:5001/api/uploads/"+album.filename}
             loader={imageLoader}
              src={album.filepath}
              alt={album.filename}
              width={width}
              height={height}
              className={cn(
                "h-auto w-auto object-cover transition-all hover:scale-105",
                aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
              )}
            />
          </div>
      
      <ContextMenu>
      <ContextMenuTrigger >
      <div className="space-y-1 text-sm">
        <h3 className="font-medium leading-none">{album.filename}</h3>
        <p className="text-xs text-muted-foreground">{album.prediction}</p>
      </div>
      </ContextMenuTrigger>
      <ContextMenuContent >
        <ContextMenuItem inset onSelect={e=>{
            deleteUpload(album.filename).then((res)=>{
                console.log(res)
                props.setRefresh(!props.refresh)
            }
            ).catch((err)=>{
                console.log(err)
            }
            )

        }}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    </div>
  )
}
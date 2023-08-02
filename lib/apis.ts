
"use-client"
import axios from "axios"
import { UploadItem } from "./data"

export const instance = axios.create()


instance.interceptors.request.use(
  (request) => {
    // const token = Cookies.get("X-PPEC-JWT")
    request.headers.Authorization = "Bearer "+"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY5MTAwODIzNCwianRpIjoiY2VjNmU5OGMtZjY1ZS00OTdiLThhNDUtMDM0NTZiMGFjZGUwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6InN1cnlhIiwibmJmIjoxNjkxMDA4MjM0LCJleHAiOjE2OTEwOTQ2MzR9.XTDG_uknVC8G1yfqh4HbQUvJp8tfMgpyiEJFZHMfn9g"
    return request
  },
  (err) => {
    console.log(err)
  }
)


export function sendChatMessage(message: string) {

    return instance.post("http://localhost:5001/api/chat", {"input_text":message})
}

export function getUploads() {
    console.log("callign api")
    return instance.get<UploadItem[]>("http://localhost:5001/api/uploads")
}

// file upload post api
export function uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)
    return instance.post("http://localhost:5001/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    
  }

// delete
export function deleteUpload(filename: string) {
    return instance.delete(`http://localhost:5001/api/uploads/${filename}`)
  }


//login
export function login(username: string, password: string) {
    return instance.post("http://localhost:5001/api/login", {
      username,
      password,
    })
  }
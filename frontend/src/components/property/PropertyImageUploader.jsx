import {useState} from "react";
import api from "../../api/axios";
export default function PropertyImageUploader({propertyId}) {
  const [files,setFiles]=useState([]);
  const upload=async()=>{const form=new FormData();files.forEach(f=>form.append("images",f));await api.post(`/properties/${propertyId}/images`,form);setFiles([]);};
  return <div dir="rtl"><input type="file" multiple accept="image/*" onChange={e=>setFiles(Array.from(e.target.files))}/><button onClick={upload}>آپلود تصاویر</button></div>;
}

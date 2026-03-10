// src/components/BookingSection.tsx

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/i18n/LanguageContext"
import { serviceCategories, getAllServices } from "@/data/services"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

interface Booking {
  service: string
  date: string
  time: string
  name: string
  phone: string
}

const API_URL = "http://localhost:4000"

const formatPrice = (price:number)=>
price.toLocaleString("ru-RU")

const getNextDays=(count:number)=>{

const days:string[]=[]
const today=new Date()

for(let i=1;i<=count;i++){

const d=new Date(today)
d.setDate(today.getDate()+i)

days.push(d.toISOString().split("T")[0])

}

return days

}

const generateTimeSlots=(date:string)=>{

const d=new Date(date)

const isWeekend=
d.getDay()===0||
d.getDay()===6

const start=isWeekend?10:9
const end=isWeekend?22:21

const slots:string[]=[]

for(let h=start;h<end;h++){

slots.push(`${String(h).padStart(2,"0")}:00`)
slots.push(`${String(h).padStart(2,"0")}:30`)

}

return slots

}

export default function BookingSection(){

const {t}=useLanguage()

const services=getAllServices()

const [category,setCategory]=useState(serviceCategories[0].id)

const [step,setStep]=useState(0)

const [booking,setBooking]=useState<Booking>({
service:"",
date:"",
time:"",
name:"",
phone:""
})

const [bookedSlots,setBookedSlots]=useState<string[]>([])
const [confirmed,setConfirmed]=useState(false)

const dates=useMemo(()=>getNextDays(14),[])

const timeSlots=useMemo(()=>{

if(!booking.date) return []

return generateTimeSlots(booking.date)

},[booking.date])

const categoryData=serviceCategories.find(c=>c.id===category)

const selectedService=services.find(
s=>s.id===booking.service
)

useEffect(()=>{

if(!booking.date) return

const load=async()=>{

try{

const res=await fetch(
`${API_URL}/availability?date=${booking.date}`
)

const data=await res.json()

setBookedSlots(data)

}catch(e){

console.error(e)

}

}

load()

},[booking.date])

const handleConfirm=async()=>{

try{

const res=await fetch(`${API_URL}/bookings`,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

serviceId:booking.service,
serviceName:selectedService?.nameKey,
price:selectedService?.price,

date:booking.date,
time:booking.time,

name:booking.name,
phone:booking.phone

})

})

if(!res.ok){

const data=await res.json()
alert(data.message)
return

}

setConfirmed(true)

}catch(e){

alert("Server error")

}

}

const formatDate=(d:string)=>

new Date(d).toLocaleDateString(undefined,{
weekday:"short",
month:"short",
day:"numeric"
})

if(confirmed){

return(

<section className="py-32">

<div className="max-w-xl mx-auto text-center">

<Check className="mx-auto mb-6 text-primary" size={42}/>

<h3 className="text-3xl font-display mb-3">
{t("booking.success")}
</h3>

<p className="text-muted-foreground">
{t("booking.success_message")}
</p>

</div>

</section>

)

}

return(

<section className="py-28">

<div className="max-w-5xl mx-auto px-4">

<h2 className="text-center text-5xl font-display mb-16">
{t("booking.title")}
</h2>

{/* CATEGORY TABS */}

<div className="flex justify-center gap-3 mb-12 flex-wrap">

{serviceCategories.map(cat=>(

<button
key={cat.id}

onClick={()=>{

setCategory(cat.id)
setBooking(b=>({...b,service:""}))

}}

className={`px-6 py-3 rounded-full border text-sm transition
${category===cat.id
?"bg-primary text-white border-primary"
:"border-border hover:border-primary"}`}

>

{cat.icon} {t(cat.nameKey)}

</button>

))}

</div>

{/* SERVICES */}

<div className="grid md:grid-cols-2 gap-4 mb-16">

{categoryData?.services.map(service=>(

<button
key={service.id}

onClick={()=>setBooking(b=>({
...b,
service:service.id
}))}

className={`p-6 rounded-2xl border text-left transition
hover:shadow-lg
${booking.service===service.id
?"border-primary bg-primary/5"
:"border-border"}`}

>

<div className="flex justify-between">

<div className="font-medium">
{t(service.nameKey)}
</div>

<div className="text-primary">
{formatPrice(service.price)}
</div>

</div>

</button>

))}

</div>

{/* DATE */}

{booking.service && (

<>

<h3 className="text-xl font-display mb-4">
{t("booking.select_date")}
</h3>

<div className="grid grid-cols-3 md:grid-cols-7 gap-3 mb-16">

{dates.map(date=>(

<button
key={date}

onClick={()=>setBooking(b=>({
...b,
date,
time:""
}))}

className={`p-4 rounded-xl border
${booking.date===date
?"border-primary bg-primary/10"
:"border-border"}`}

>

{formatDate(date)}

</button>

))}

</div>

</>

)}

{/* TIME */}

{booking.date && (

<>

<h3 className="text-xl font-display mb-4">
{t("booking.select_time")}
</h3>

<div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-16">

{timeSlots.map(time=>{

const isBooked=
bookedSlots.includes(`${booking.date}-${time}`)

return(

<button
key={time}

disabled={isBooked}

onClick={()=>setBooking(b=>({
...b,
time
}))}

className={`py-3 rounded-xl border
${isBooked
?"opacity-30"
:booking.time===time
?"border-primary bg-primary/10"
:"border-border hover:border-primary"}`}

>

{time}

</button>

)

})}

</div>

</>

)}

{/* FORM */}

{booking.time && (

<div className="max-w-md">

<h3 className="text-xl font-display mb-4">
{t("booking.details")}
</h3>

<div className="space-y-4">

<input
type="text"
placeholder={t("booking.name")}
value={booking.name}
onChange={e=>setBooking(b=>({...b,name:e.target.value}))}
className="w-full border rounded-xl px-4 py-3"
/>

<input
type="tel"
placeholder={t("booking.phone")}
value={booking.phone}
onChange={e=>setBooking(b=>({...b,phone:e.target.value}))}
className="w-full border rounded-xl px-4 py-3"
/>

<button
onClick={handleConfirm}
className="w-full bg-primary text-white py-3 rounded-full mt-4"
>

{t("booking.confirm_booking")}

</button>

</div>

</div>

)}

</div>

</section>

)

}
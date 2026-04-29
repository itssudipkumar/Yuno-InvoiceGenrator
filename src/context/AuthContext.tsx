import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export interface BusinessInfo {
  name:string; abn:string; email:string; phone:string; address:string
  logo?:string; bsb?:string; accountNumber?:string; accountName?:string; bankName?:string; website?:string
}
export interface User {
  id:string; email:string; password:string
  businessInfo:BusinessInfo; invoiceDesign:string; createdAt:string
}
interface AuthCtx {
  user:User|null
  login:(e:string,p:string)=>{ok:boolean;msg:string}
  register:(e:string,p:string,biz:string)=>{ok:boolean;msg:string}
  logout:()=>void
  updateUser:(u:User)=>void
}
const Ctx = createContext<AuthCtx|null>(null)

export function AuthProvider({children}:{children:ReactNode}) {
  const [user,setUser] = useState<User|null>(()=>{
    try{const s=localStorage.getItem('yuno_current_user');return s?JSON.parse(s):null}catch{return null}
  })
  const getUsers=():User[]=>{try{return JSON.parse(localStorage.getItem('yuno_users')||'[]')}catch{return[]}}
  const saveUsers=(u:User[])=>localStorage.setItem('yuno_users',JSON.stringify(u))

  const login=(email:string,password:string)=>{
    const found=getUsers().find(u=>u.email===email&&u.password===btoa(password))
    if(!found) return{ok:false,msg:'Invalid email or password'}
    setUser(found); localStorage.setItem('yuno_current_user',JSON.stringify(found))
    return{ok:true,msg:'Welcome back!'}
  }
  const register=(email:string,password:string,bizName:string)=>{
    const users=getUsers()
    if(users.find(u=>u.email===email)) return{ok:false,msg:'Email already registered'}
    const nu:User={id:Date.now().toString(),email,password:btoa(password),
      businessInfo:{name:bizName,abn:'',email,phone:'',address:''},
      invoiceDesign:'slate',createdAt:new Date().toISOString()}
    saveUsers([...users,nu]); setUser(nu)
    localStorage.setItem('yuno_current_user',JSON.stringify(nu))
    return{ok:true,msg:'Account created!'}
  }
  const logout=()=>{setUser(null);localStorage.removeItem('yuno_current_user')}
  const updateUser=(u:User)=>{
    const users=getUsers(); const idx=users.findIndex(x=>x.id===u.id)
    if(idx!==-1){users[idx]=u;saveUsers(users)}
    setUser(u); localStorage.setItem('yuno_current_user',JSON.stringify(u))
  }
  return <Ctx.Provider value={{user,login,register,logout,updateUser}}>{children}</Ctx.Provider>
}
export const useAuth=()=>{const c=useContext(Ctx);if(!c)throw new Error('useAuth outside AuthProvider');return c}

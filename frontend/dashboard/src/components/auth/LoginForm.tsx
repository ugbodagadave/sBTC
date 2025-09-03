import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt with:', { email, password })
    
    // For demo purposes, we'll just set a token and navigate to dashboard
    // In a real app, you would validate credentials with your backend
    localStorage.setItem('authToken', 'demo-token')
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} className={cn("grid gap-4", className)} {...props}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="ml-auto inline-block text-sm underline">
            Forgot your password?
          </a>
        </div>
        <Input 
          id="password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
      <Button variant="outline" className="w-full">
        Login with Google
      </Button>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <a href="#" className="underline">
          Sign up
        </a>
      </div>
    </form>
  )
}
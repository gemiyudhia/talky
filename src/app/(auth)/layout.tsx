import { ReactNode } from "react"

type AuthLayoutProps = {
  children: ReactNode
}

const AuthLayout = ({children}: AuthLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  )
}

export default AuthLayout

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"

const inter = Inter({ subsets: ["latin"] })
const GOOGLE_CLIENT_ID = "696277523885-ic6h98jf57vdbhu2bq7eb2opjpgvnf6g.apps.googleusercontent.com"

export const metadata: Metadata = {
  title: "CryptoPaws - Animal Welfare Platform",
  description: "Help animals in need through blockchain-powered donations",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}

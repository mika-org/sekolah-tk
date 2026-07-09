import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F9F4ED] font-sans antialiased text-[#07265F] flex flex-col justify-between overflow-x-hidden">
      <Navbar />
      {/* We add padding top to clear the fixed navbar */}
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}

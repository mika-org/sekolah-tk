'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getChatPartners, getChatMessages, sendChatMessage } from '@/actions/chat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { MessageSquare, Send, RefreshCw, User } from 'lucide-react'

export default function GuruChatPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [selectedPartner, setSelectedPartner] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch chat partners
  const loadPartners = async () => {
    setLoadingPartners(true)
    const result = await getChatPartners()
    if (result.success) {
      setPartners(result.partners || [])
    } else {
      toast.error(result.error || 'Gagal memuat kontak orang tua.')
    }
    setLoadingPartners(false)
  }

  // 2. Fetch messages for selected partner
  const loadMessages = async (partnerId: string, silent = false) => {
    if (!silent) setLoadingMessages(true)
    const result = await getChatMessages(partnerId)
    if (result.success) {
      setMessages(result.messages || [])
    }
    if (!silent) setLoadingMessages(false)
  }

  useEffect(() => {
    loadPartners()
  }, [])

  // Auto scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 3 seconds if a partner is selected
  useEffect(() => {
    if (!selectedPartner) return
    const t = setInterval(() => {
      loadMessages(selectedPartner.id, true)
    }, 3000)
    return () => clearInterval(t)
  }, [selectedPartner])

  const handleSelectPartner = (partner: any) => {
    setSelectedPartner(partner)
    loadMessages(partner.id)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedPartner) return

    setSending(true)
    const result = await sendChatMessage(selectedPartner.id, newMessage)
    if (result.success) {
      setNewMessage('')
      // Add message locally to feel instant
      setMessages(prev => [...prev, result.data])
    } else {
      toast.error(result.error || 'Gagal mengirim pesan.')
    }
    setSending(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-blue">Chat Orang Tua</h1>
          <p className="text-gray-500 font-semibold text-xs mt-1">Saluran komunikasi langsung dengan Orang Tua/Wali murid kelas Anda.</p>
        </div>
        <Button onClick={loadPartners} variant="outline" className="border-gray-200 font-bold rounded-xl text-xs cursor-pointer gap-2">
          <RefreshCw size={14} /> Refresh Kontak
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
        {/* Partners List Panel */}
        <div className="lg:col-span-4 h-full">
          <Card className="bg-white rounded-[32px] shadow-sm border-none h-full flex flex-col overflow-hidden">
            <CardHeader className="p-6 border-b border-gray-50">
              <CardTitle className="text-sm font-black text-primary-blue flex items-center gap-2">
                <User size={18} className="text-primary-green" />
                Kontak Orang Tua
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-gray-400">Daftar orang tua murid aktif di kelas Anda.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {loadingPartners ? (
                <div className="p-8 text-center text-gray-400 text-xs">Memuat kontak...</div>
              ) : partners.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">Belum ada kontak orang tua aktif. Pastikan murid Anda sudah masuk kelas dan memiliki wali kelas.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {partners.map(partner => {
                    const active = selectedPartner?.id === partner.id
                    return (
                      <button
                        key={partner.id}
                        onClick={() => handleSelectPartner(partner)}
                        className={`w-full p-5 text-left flex items-start gap-3 transition-colors ${active ? 'bg-primary-blue/5 border-l-4 border-primary-green' : 'hover:bg-gray-50/50'}`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-primary-green/10 text-primary-green flex items-center justify-center font-black text-sm flex-shrink-0">
                          {partner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-primary-blue truncate">{partner.name}</p>
                          <p className="text-[10px] text-gray-450 truncate font-semibold mt-0.5">{partner.email}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Window Panel */}
        <div className="lg:col-span-8 h-full">
          <Card className="bg-white rounded-[32px] shadow-sm border-none h-full flex flex-col overflow-hidden">
            {selectedPartner ? (
              <>
                {/* Active Partner Header */}
                <CardHeader className="p-6 border-b border-gray-50 flex flex-row items-center justify-between flex-shrink-0">
                  <div>
                    <CardTitle className="text-sm font-black text-primary-blue">{selectedPartner.name}</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-primary-green uppercase tracking-wide">Orang Tua / Wali Murid</CardDescription>
                  </div>
                  <Button onClick={() => loadMessages(selectedPartner.id)} variant="ghost" className="p-2 h-auto hover:bg-[#F8F6F2] rounded-xl text-gray-400 hover:text-primary-blue">
                    <RefreshCw size={14} />
                  </Button>
                </CardHeader>

                {/* Messages Body */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F6F2]/30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-250 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col">
                  {loadingMessages ? (
                    <div className="my-auto text-center text-gray-400 text-xs">Memuat obrolan...</div>
                  ) : messages.length === 0 ? (
                    <div className="my-auto text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                      <MessageSquare size={32} className="text-gray-300" />
                      <span>Belum ada riwayat pesan. Kirim pesan pertama Anda di bawah!</span>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {messages.map(msg => {
                        const isMe = msg.sender_id !== selectedPartner.id
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${isMe ? 'bg-primary-blue text-white rounded-br-none shadow-sm' : 'bg-white text-primary-blue rounded-bl-none border border-gray-100 shadow-sm'}`}>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              <p className={`text-[8px] font-bold mt-1.5 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>

                {/* Message Input Footer */}
                <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Tulis pesan untuk orang tua..."
                      className="bg-[#F8F6F2] border-transparent focus:bg-white focus:border-primary-green rounded-xl text-xs h-11 font-medium"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="bg-primary-green hover:bg-primary-green/90 text-white rounded-xl h-11 px-5 cursor-pointer shadow-md shadow-primary-green/10"
                    >
                      <Send size={14} className={sending ? 'animate-pulse' : ''} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="m-auto text-center text-gray-400 space-y-3 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-50 text-primary-blue rounded-full flex items-center justify-center">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-primary-blue">Ruang Komunikasi</h3>
                  <p className="text-[11px] font-medium max-w-[280px] leading-relaxed mt-1 text-gray-405">
                    Pilih salah satu kontak orang tua di sebelah kiri untuk mulai berkirim pesan.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

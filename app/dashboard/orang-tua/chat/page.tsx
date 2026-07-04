'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getChatPartners, getChatMessages, sendChatMessage } from '@/actions/chat'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { MessageSquare, Send, RefreshCw, Sparkles } from 'lucide-react'

export default function OrangTuaChatPage() {
  const [teacher, setTeacher] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingTeacher, setLoadingTeacher] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch teacher (chat partner)
  const loadTeacher = async () => {
    setLoadingTeacher(true)
    const result = await getChatPartners()
    if (result.success && result.partners && result.partners.length > 0) {
      const activeTeacher = result.partners[0]
      setTeacher(activeTeacher)
      await loadMessages(activeTeacher.id)
    } else {
      setTeacher(null)
    }
    setLoadingTeacher(false)
  }

  // 2. Fetch messages
  const loadMessages = async (teacherId: string, silent = false) => {
    if (!silent) setLoadingMessages(true)
    const result = await getChatMessages(teacherId)
    if (result.success) {
      setMessages(result.messages || [])
    }
    if (!silent) setLoadingMessages(false)
  }

  useEffect(() => {
    loadTeacher()
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for messages every 3 seconds if teacher is selected
  useEffect(() => {
    if (!teacher) return
    const t = setInterval(() => {
      loadMessages(teacher.id, true)
    }, 3000)
    return () => clearInterval(t)
  }, [teacher])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !teacher) return

    setSending(true)
    const result = await sendChatMessage(teacher.id, newMessage)
    if (result.success) {
      setNewMessage('')
      setMessages(prev => [...prev, result.data])
    } else {
      toast.error(result.error || 'Gagal mengirim pesan.')
    }
    setSending(false)
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-primary-blue to-blue-900 text-white p-8 sm:p-10 rounded-[32px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <MessageSquare size={12} className="text-amber-400" />
            <span>Komunikasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Hubungi Wali Kelas</h1>
          <p className="text-gray-300 font-medium text-xs">Konsultasikan perkembangan belajar dan absensi ananda langsung dengan wali kelas.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto h-[550px]">
        {loadingTeacher ? (
          <div className="p-12 text-center text-gray-400 text-xs">Memuat informasi wali kelas...</div>
        ) : !teacher ? (
          <Card className="bg-white rounded-[32px] p-12 text-center shadow-sm border-none">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="font-extrabold text-sm text-primary-blue">Belum Ada Wali Kelas</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed mt-2">
              Ananda belum ditempatkan dalam kelas aktif atau kelas ananda belum memiliki guru wali kelas terdaftar di master data. Silakan hubungi admin sekolah.
            </p>
          </Card>
        ) : (
          <Card className="bg-white rounded-[32px] shadow-sm border-none h-full flex flex-col overflow-hidden">
            {/* Header info */}
            <div className="p-6 border-b border-gray-50 flex items-center justify-between flex-shrink-0 bg-white z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-blue/10 text-primary-blue flex items-center justify-center font-black text-sm">
                  {teacher.name.charAt(8)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-primary-blue">{teacher.name}</h3>
                  <p className="text-[10px] text-primary-green font-bold uppercase tracking-wider mt-0.5">Wali Kelas Aktif</p>
                </div>
              </div>
              <Button onClick={() => loadMessages(teacher.id)} variant="ghost" className="p-2.5 h-auto hover:bg-[#F8F6F2] rounded-xl text-gray-400 hover:text-primary-blue">
                <RefreshCw size={14} />
              </Button>
            </div>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F6F2]/30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-250 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-col">
              {loadingMessages ? (
                <div className="my-auto text-center text-gray-400 text-xs">Memuat pesan...</div>
              ) : messages.length === 0 ? (
                <div className="my-auto text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                  <MessageSquare size={32} className="text-gray-300" />
                  <span>Kirim pesan salam pertama untuk memulai konsultasi!</span>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {messages.map(msg => {
                    const isMe = msg.sender_id === teacher.id ? false : true
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${isMe ? 'bg-primary-blue text-white rounded-br-none shadow-sm' : 'bg-white text-primary-blue rounded-bl-none border border-gray-100 shadow-sm'}`}>
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

            {/* Input bar */}
            <div className="p-4 border-t border-gray-50 flex-shrink-0 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan Anda ke wali kelas..."
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
          </Card>
        )}
      </div>
    </div>
  )
}

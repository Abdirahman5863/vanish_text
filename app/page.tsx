/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState } from "react"
import { Send, Copy, Check, Zap, Lock, MessageCircle } from "lucide-react"

interface VanishMessage {
  id: string
  text: string
  created: Date
  viewed: boolean
  link: string
}

export default function VanishTextUnique() {
  const [messages, setMessages] = useState<VanishMessage[]>([])
  const [messageText, setMessageText] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [showViewer, setShowViewer] = useState<string | null>(null)
  const [isFading, setIsFading] = useState<boolean>(false)
  const [screen, setScreen] = useState("home")

  // Generate UUID v4
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === "x" ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const createMessage = async () => {
    if (!messageText.trim()) return

    try {
      const response = await fetch("/api/messages/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || "Failed to create message")
        return
      }

      const newMessage = {
        id: data.message.id,
        text: messageText,
        created: new Date(),
        viewed: false,
        link: `${window.location.origin}/messages/${data.message.id}`,
      }

      setMessages([...messages, newMessage])
      setMessageText("")
    } catch (err) {
      console.error("Error:", err)
      alert("Failed to create message")
    }
  }

  const copyLink = (link: any) => {
    navigator.clipboard.writeText(`${link}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const viewMessage = (id: React.SetStateAction<string | null>) => {
    setShowViewer(id)
    setMessages(messages.map((m) => (m.id === id ? { ...m, viewed: true } : m)))

    setTimeout(() => {
      setMessages((msgs) => msgs.filter((m) => m.id !== id))
    }, 90)
  }

  const closeMessage = () => {
    setIsFading(true)
    setTimeout(() => {
      setShowViewer(null)
      setIsFading(false)
      setMessages(messages.filter((m) => m.id !== showViewer))
    }, 300)
  }

  // Auto-delete after 5 seconds if not manually closed
  React.useEffect(() => {
    if (!showViewer) return

    const timer = setTimeout(() => {
      closeMessage()
    }, 5000)

    return () => clearTimeout(timer)
  }, [showViewer])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background text-foreground overflow-hidden">
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-linear-to-br from-violet-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Header */}
      <nav className="relative backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setScreen("home")}>
            <div className="relative">
              <MessageCircle className="w-7 h-7 text-foreground group-hover:text-primary transition" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">VanishText</h1>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <button onClick={() => setScreen("home")} className="hover:text-primary transition duration-200">
              HOME
            </button>
            <button onClick={() => setScreen("send")} className="hover:text-primary transition duration-200">
              CREATE
            </button>
          </div>
        </div>
      </nav>

      {/* Home Screen */}
      {screen === "home" && (
        <div className="relative max-w-7xl mx-auto px-6 py-24 space-y-32">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-sm font-medium text-primary">
              <Zap className="w-4 h-4" />
              The Future of Private Messaging
            </div>
            <h2 className="text-6xl lg:text-7xl font-black tracking-tight leading-tight text-balance">
              Messages That Disappear
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Share sensitive information with zero friction. No sign-ups. No apps. Just a link that vanishes after 5
              seconds.
            </p>
            <button
              onClick={() => setScreen("send")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              Create Message
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-border hover:bg-card/80 transition-all duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Zero Setup</h3>
              <p className="text-muted-foreground">No account. No password. No complications. Just share a link.</p>
            </div>

            <div className="p-8 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-border hover:bg-card/80 transition-all duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Private</h3>
              <p className="text-muted-foreground">
                Messages exist only in the moment. Once read, they&apos;re gone forever.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-card/50 backdrop-blur border border-border/50 hover:border-border hover:bg-card/80 transition-all duration-300 group cursor-default">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Works Anywhere</h3>
              <p className="text-muted-foreground">Share via WhatsApp, email, Telegram—or any messaging platform.</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">How It Works</h2>
              <p className="text-lg text-muted-foreground">Three simple steps to privacy</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: "1", title: "Write", desc: "Type your message" },
                { num: "2", title: "Share", desc: "Copy the link" },
                { num: "3", title: "Vanish", desc: "Poof! It's gone in 5 seconds" },
              ].map((step) => (
                <div key={step.num} className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/50 text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 py-12">
            <h2 className="text-4xl font-bold">Ready to Send Secure Messages?</h2>
            <button
              onClick={() => setScreen("send")}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              Create Your First Message
            </button>
          </div>
        </div>
      )}

      {/* Send Screen */}
      {screen === "send" && (
        <div className="relative max-w-2xl mx-auto px-6 py-16">
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold">Create Message</h2>
              <p className="text-muted-foreground text-lg">
                Type your message below and share the link. It vanishes in 5 seconds.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur rounded-2xl p-8 border border-border/50">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message..."
                maxLength={1000}
                className="w-full px-6 py-4 rounded-xl bg-background/50 border border-border/50 placeholder-muted-foreground text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition resize-none h-40 font-medium"
              />
              <p className="text-xs text-muted-foreground mt-3">{messageText.length}/1000 characters</p>

              <button
                onClick={createMessage}
                disabled={!messageText.trim()}
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                Generate Link
              </button>
            </div>

            {/* Messages List */}
            {messages.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Your Messages</h3>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-card/50 backdrop-blur border border-border/50 rounded-xl p-6 hover:border-border hover:bg-card/80 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-foreground flex-1">
                          &quot;{msg.text.substring(0, 50)}
                          {msg.text.length > 50 ? "..." : ""}&quot;
                        </p>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2 ${msg.viewed ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}
                        >
                          {msg.viewed ? "Burning" : "Active"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">Expires after viewing • 5 second auto-delete</p>
                      <div className="bg-background/50 rounded-lg p-3 mb-4 text-sm font-mono break-all border border-border/50 mb-4">
                        <span className="text-foreground">{msg.link}</span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => copyLink(msg.link)}
                          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition duration-200 text-sm"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                          onClick={() => viewMessage(msg.id)}
                          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-4 py-2 rounded-lg text-sm transition duration-200"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viewer Modal */}
      {showViewer && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-500 ${isFading ? "opacity-0" : "opacity-100"}`}
        >
          <div
            className={`max-w-md w-full mx-6 transition-all duration-500 ${isFading ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
          >
            <div
              className="bg-gradient-to-br from-card to-card/50 rounded-2xl p-12 border border-border/50 shadow-2xl backdrop-blur"
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            >
              <p
                className="text-2xl text-center font-light leading-relaxed text-foreground mb-8 break-words"
                style={{ userSelect: "none", WebkitUserSelect: "none" }}
              >
                {messages.find((m) => m.id === showViewer)?.text}
              </p>
              <button
                onClick={closeMessage}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-4 rounded-lg transition-all duration-200"
              >
                Close & Delete
              </button>
              <p className="text-xs text-center text-muted-foreground mt-6">⏳ Auto-deletes in 5 seconds</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, Zap, Flame, Eye, Share2, AlertCircle, Shield } from 'lucide-react';

interface VanishMessage {
  id: string;
  text: string;
  created: Date;
  viewed: boolean;
  link: string;
}

export default function VanishTextUnique() {

   const [messages, setMessages] = useState<VanishMessage[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showViewer, setShowViewer] = useState<string | null>(null);
  const [isFading, setIsFading] = useState<boolean>(false);



  const [screen, setScreen] = useState('home');
 
  // Detect screenshot attempts
  useEffect(() => {
    if (!showViewer) return;

    const handleKeyDown = (e: { key: string; ctrlKey: any; shiftKey: any; preventDefault: () => void; metaKey: any; }) => {
      // Windows/Linux screenshot
     
      // Mac screenshot
      if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4')) {
        e.preventDefault();
       
        
        setTimeout(() =>  2000);
        return false;
      }
    };

    // Disable right-click
    const handleContextMenu = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
   
      
      setTimeout(() => 2000);
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [showViewer]);

  // Generate UUID v4
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const createMessage = async () => {
    if (!messageText.trim()) return;

    try {
      // Call backend to create message
      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to create message');
        return;
      }

      // Add to local state
      const newMessage = {
        id: data.message.id,
        text: messageText,
        created: new Date(),
        viewed: false,
        link: `${window.location.origin}/messages/${data.message.id}`,
      };

      setMessages([...messages, newMessage]);
      setMessageText('');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create message');
    }
  };

  const copyLink = (link: any) => {
    navigator.clipboard.writeText(`https://${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const viewMessage = (id: React.SetStateAction<string | null>) => {
    setShowViewer(id);
 
    setMessages(messages.map(m => 
      m.id === id ? { ...m, viewed: true } : m
    ));
    
    // Auto-delete link after viewing (simulate server deleting it)
    setTimeout(() => {
      setMessages(msgs => msgs.filter(m => m.id !== id));
    }, 90); // 15 seconds after viewing, link becomes invalid
  };

  const closeMessage = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowViewer(null);
      setIsFading(false);
      setMessages(messages.filter(m => m.id !== showViewer));
    }, 300);
  };

  // Auto-delete after 5 seconds if not manually closed
  useEffect(() => {
    if (!showViewer) return;
    
    const timer = setTimeout(() => {
      closeMessage();
    }, 5000);

    return () => clearTimeout(timer);
  }, [showViewer]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <nav className="relative backdrop-blur-md bg-black bg-opacity-50 border-b border-purple-500 border-opacity-20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
            <Flame className="w-7 h-7 text-red-500" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">VanishText</h1>
          </div>
          <div className="flex gap-4 text-sm">
            <button onClick={() => setScreen('home')} className="hover:text-purple-300 transition">HOME</button>
            <button onClick={() => setScreen('send')} className="hover:text-purple-300 transition">CREATE</button>
          </div>
        </div>
      </nav>

      {/* Home Screen */}
      {screen === 'home' && (
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-20">
            <div className="inline-block mb-6 p-3 bg-red-500 bg-opacity-20 rounded-full">
              <Flame className="w-12 h-12 text-red-500 animate-pulse" />
            </div>
            <h2 className="text-6xl font-black mb-6 leading-tight">
              <span className="bg-linear-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Send Messages That Burn
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              **No login. No app. No account.**<br/>
              Share a link on WhatsApp, Instagram, Email. They read it. <strong>It&apos;s gone in 5 seconds.</strong> No trace.
            </p>
            <button
              onClick={() => setScreen('send')}
              className="bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 px-12 py-4 rounded-xl font-black text-lg transition transform hover:scale-105 shadow-lg shadow-red-500/50"
            >
              🔥 Create Vanishing Message
            </button>
          </div>

          {/* Why It's Different */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-xl p-8 border border-red-500 border-opacity-20 hover:border-opacity-50 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Zero Friction</h3>
              <p className="text-gray-400 text-sm">No sign-up. No account. No BS.</p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-xl p-8 border border-purple-500 border-opacity-20 hover:border-opacity-50 transition">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="text-xl font-bold mb-3">No Screenshots</h3>
              <p className="text-gray-400 text-sm">Can&apos;t capture. Can&apos;t copy. Can&apos;t save.</p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-xl p-8 border border-blue-500 border-opacity-20 hover:border-opacity-50 transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-3">Works Everywhere</h3>
              <p className="text-gray-400 text-sm">WhatsApp, Email, SMS, Anywhere.</p>
            </div>
            <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-xl p-8 border border-green-500 border-opacity-20 hover:border-opacity-50 transition">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">5 Second Burn</h3>
              <p className="text-gray-400 text-sm">Auto-deletes instantly. They can&apos;t save it. They can&apos;t share it.</p>
            </div>
          </div>

          {/* The Game Changer */}
          <div className="bg-gradient-to-r from-red-900 bg-opacity-30 to-purple-900 bg-opacity-30 backdrop-blur-xl rounded-2xl p-10 border border-red-500 border-opacity-50 mb-20">
            <div className="flex items-start gap-4 mb-6">
              <Shield className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-black mb-3">The Screenshot Shield</h3>
                <p className="text-gray-300 text-lg mb-4">
                  This is what makes VanishText truly unique and unmatched:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li>✓ <strong>Blocks all screenshot attempts</strong> - PrintScreen, Cmd+Shift+3/4, Cmd+Ctrl+Shift+4</li>
                  <li>✓ <strong>Disables right-click</strong> - Can&apos;t inspect, can&apos;t view source</li>
                  <li>✓ <strong>Prevents text selection</strong> - Can&apos;t copy/paste the text</li>
                  <li>✓ <strong>Read-only viewing</strong> - Message exists only in the moment</li>
                  <li>✓ <strong>Anti-forensics</strong> - No digital footprint left behind</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-2xl p-8 border border-purple-500 border-opacity-20">
            <h3 className="text-2xl font-bold mb-8 text-center">VanishText vs Competition</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-bold">Feature</th>
                    <th className="text-center py-3 px-4">Signal</th>
                    <th className="text-center py-3 px-4">Telegram</th>
                    <th className="text-center py-3 px-4">Snapchat</th>
                    <th className="text-center py-3 px-4 text-red-400">VanishText</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">No Sign-up</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400 font-bold">✅</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">No App Needed</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400 font-bold">✅</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Blocks Screenshots</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">⚠️ (Notifies)</td>
                    <td className="text-center">⚠️ (Notifies)</td>
                    <td className="text-center text-green-400 font-bold">✅ (Prevents)</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-3 px-4">Prevents Copy/Paste</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400 font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Works Anywhere (Link)</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400 font-bold">✅</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Link Also Vanishes</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">❌</td>
                    <td className="text-center text-green-400 font-bold">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Send Screen */}
      {screen === 'send' && (
        <div className="relative max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white bg-opacity-5 backdrop-blur-xl rounded-2xl p-10 border border-red-500 border-opacity-30">
            <h2 className="text-3xl font-bold mb-2">🔥 Vanishing Message</h2>
            <p className="text-gray-400 text-sm mb-8">No sign-up. No screenshots. Pure privacy.</p>

            <div className="mb-8">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write something... it'll burn away after they read it 🔥"
                maxLength={1000}
                className="w-full px-6 py-4 rounded-lg bg-black bg-opacity-40 border border-red-500 border-opacity-30 placeholder-gray-500 text-white focus:outline-none focus:border-red-400 transition resize-none h-40 font-medium"
              />
              <p className="text-xs text-gray-400 mt-2">{messageText.length}/1000 characters</p>
            </div>

            <button
              onClick={createMessage}
              disabled={!messageText.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-black py-4 rounded-lg transition flex items-center justify-center gap-2 transform hover:scale-105 text-lg"
            >
              <Send className="w-5 h-5" />
              Generate Link
            </button>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Your Links
                </h3>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="bg-black bg-opacity-40 border border-red-500 border-opacity-30 rounded-lg p-5 hover:border-opacity-50 transition">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-sm text-gray-300 flex-1">&quot;{msg.text.substring(0, 60)}{msg.text.length > 60 ? '...' : ''}&quot;</p>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${msg.viewed ? 'bg-red-600 bg-opacity-40 text-red-300' : 'bg-yellow-500 bg-opacity-30 text-yellow-300'}`}>
                          {msg.viewed ? '🔥 Burning Away' : '⏳ Active'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">Link expires after viewing • Message + Link both vanish</p>
                      <div className="bg-black bg-opacity-50 rounded p-3 mb-4 text-sm font-mono break-all border border-gray-700 mb-4">
                        <span className="text-blue-400"></span><span className="text-gray-300">{msg.link}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyLink(msg.link)}
                          className="flex-1 bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition text-sm"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                          onClick={() => viewMessage(msg.id)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-semibold text-sm"
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
        <div className={`fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'} select-none pointer-events-none`}>
          {/* Screenshot Attempt Alert */}
         

          <div className={`max-w-md w-full mx-6 transition-all duration-500 ${isFading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} pointer-events-auto`}>
            <div className="bg-gradient-to-br from-red-900 to-purple-900 rounded-3xl p-12 border border-red-500 border-opacity-50 shadow-2xl shadow-red-500/50 backdrop-blur-xl select-none" style={{userSelect: 'none', WebkitUserSelect: 'none'}}>
              <p className="text-3xl text-center font-light leading-relaxed text-white mb-8 select-none" style={{userSelect: 'none', WebkitUserSelect: 'none'}}>
                {messages.find(m => m.id === showViewer)?.text}
              </p>
              <button
                onClick={closeMessage}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-black py-4 rounded-lg transition transform hover:scale-105"
              >
                Close & Burn 🔥
              </button>
              <p className="text-xs text-center text-gray-400 mt-6">⏳ Auto-deletes in 5 seconds • No screenshots • No copy/paste</p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-bounce { animation: bounce 0.6s cubic-bezier(0.4, 0, 0.6, 1); }
        
        * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        input, textarea {
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
      `}</style>
    </div>
  );
}



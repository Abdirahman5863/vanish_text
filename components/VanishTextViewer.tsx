'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useVanishText } from '@/hooks/useVanishText';
import { AlertCircle, Loader } from 'lucide-react';

export default function VanishTextViewer() {
  const params = useParams();
  const messageId = params.id as string;
  const { viewMessage, loading, error } = useVanishText();
  const [messageText, setMessageText] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!messageId) return;

    const fetchMessage = async () => {
      const result = await viewMessage(messageId);
      if (result) {
        setMessageText(result.message);

        // Auto-delete after 15 seconds
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            window.location.href = '/';
          }, 800);
        }, 15000);
      }
    };

    fetchMessage();
  }, [messageId, viewMessage]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Unlocking message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <div className="bg-red-900 rounded-3xl p-12 max-w-md text-center border border-red-500">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white text-lg font-bold mb-2">Message Error</p>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`bg-gradient-to-br from-red-900 to-purple-900 rounded-3xl p-12 max-w-md w-full mx-6 border border-red-500 border-opacity-50 shadow-2xl transition-all duration-500 ${
          isFading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <p className="text-3xl text-center font-light leading-relaxed text-white mb-8">
          {messageText}
        </p>
        <p className="text-xs text-center text-gray-500">
          ⏳ Message will vanish in 15 seconds...
        </p>
      </div>
    </div>
  );
}

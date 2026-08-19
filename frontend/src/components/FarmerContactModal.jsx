import React, { useEffect, useRef, useState } from 'react';
import { Send, X, UserRound } from 'lucide-react';

import {
  createConversationId,
  getConversation,
  updateConversationMessages,
  upsertConversation
} from '../utils/conversationStorage';

const FarmerContactModal = ({
  farmerName = 'Farmer',
  productTitle = 'Produce',
  buyerName = 'Buyer',
  onClose,
  theme = 'cyber'
}) => {
  const conversationId = createConversationId(farmerName, productTitle);
  const existingConversation = getConversation(conversationId);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(
    existingConversation?.messages?.length
      ? existingConversation.messages
      : [{
          id: 1,
          sender: 'farmer',
          text: `Hello! Thanks for your interest in ${productTitle}. How can I help you?`
        }]
  );

  const messagesEndRef = useRef(null);

  useEffect(() => {
    upsertConversation({
      id: conversationId,
      farmerName,
      productTitle,
      buyerName,
      messages
    });
  }, [conversationId, farmerName, productTitle, buyerName, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const updatedMessages = [
      ...messages,
      {
        id: Date.now(),
        sender: 'buyer',
        text: trimmedMessage
      }
    ];

    setMessages(updatedMessages);
    updateConversationMessages(conversationId, updatedMessages);
    setMessage('');
  };

  const styles = {
    cyber: {
      modal: 'bg-[#0d1711] border-emerald-500/30 text-slate-100',
      header: 'border-emerald-900/40',
      input: 'bg-[#080d0a] border-emerald-900/50 text-white placeholder-slate-500',
      farmerBubble: 'bg-emerald-500/10 border-emerald-500/20',
      buyerBubble: 'bg-emerald-500 text-slate-950',
      muted: 'text-slate-400'
    },
    dark: {
      modal: 'bg-slate-900 border-slate-700 text-slate-100',
      header: 'border-slate-700',
      input: 'bg-slate-950 border-slate-700 text-white placeholder-slate-500',
      farmerBubble: 'bg-slate-800 border-slate-700',
      buyerBubble: 'bg-teal-500 text-slate-950',
      muted: 'text-slate-400'
    },
    light: {
      modal: 'bg-white border-slate-200 text-slate-900',
      header: 'border-slate-200',
      input: 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400',
      farmerBubble: 'bg-slate-50 border-slate-200',
      buyerBubble: 'bg-emerald-600 text-white',
      muted: 'text-slate-500'
    }
  }[theme];

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`w-full max-w-md h-[min(620px,85vh)] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${styles.modal}`}>
        <div className={`px-5 py-4 border-b flex items-center justify-between ${styles.header}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserRound className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-black">{farmerName}</p>
              <p className={`text-[10px] ${styles.muted}`}>About {productTitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-black/10 transition"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className={`px-5 py-2 text-[10px] font-mono border-b ${styles.header} ${styles.muted}`}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          DIRECT FARMER CONTACT
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl border text-xs leading-relaxed ${
                item.sender === 'buyer'
                  ? `rounded-br-md border-transparent ${styles.buyerBubble}`
                  : `rounded-bl-md ${styles.farmerBubble}`
              }`}>
                {item.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className={`p-4 border-t ${styles.header}`}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className={`flex-1 min-w-0 px-4 py-3 rounded-xl border outline-none text-xs focus:ring-2 focus:ring-emerald-500/20 ${styles.input}`}
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 flex items-center justify-center transition"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FarmerContactModal;
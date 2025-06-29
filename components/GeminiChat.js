'use client';
import { useEffect, useRef, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp } from "react-icons/fa6";
import ReactMarkdown from 'react-markdown';
import removeMarkdown from 'remove-markdown';


export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const chatRef = useRef(null);
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const plainText = removeMarkdown(text);
    const speakWithVoice = () => {
      const voices = synth.getVoices();
      const selectedVoice =
        voices.find(voice => voice.name.includes("Jenny") || voice.name.includes("Aria")) || voices[0];
      const utterance = new SpeechSynthesisUtterance(plainText);
      utterance.voice = selectedVoice;
      utterance.rate = 1.1;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      synth.cancel();
      synth.speak(utterance);
    };
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = speakWithVoice;
    } else {
      speakWithVoice();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    // Save user's message
    await addDoc(collection(db, 'chats'), {
      userId: user.uid,
      sender: 'user',
      message: input,
      timestamp: serverTimestamp()
    });

    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input })
    });

    const data = await res.json();
    const aiText = data.text || 'No response';
    speak(aiText);
    setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    setIsTyping(false);

    // Save AI's response
    await addDoc(collection(db, 'chats'), {
      userId: user.uid,
      sender: 'ai',
      message: aiText,
      timestamp: serverTimestamp()
    });
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    (async () => {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const chats = snapshot.docs.map(doc => doc.data());
      setMessages(chats.map(c => ({ sender: c.sender, text: c.message })));
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (chatRef.current) {
      const last = chatRef.current.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className="chat-wrapper">
      <div className="chat-container" ref={chatRef}>
        {loading ? (
          <div className="loading-spinner">
            <span className="loader"></span>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`chat-bubble ${msg.sender}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {msg.sender === 'ai' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}

              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isTyping && <div className="typing">
          <div className="dot-typing">
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder='Ask any health query...'
        />
        <button onClick={handleSend}><FaArrowUp /></button>
      </div>
    </div>
  );
}

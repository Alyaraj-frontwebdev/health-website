'use client';
import React, { useEffect, useState } from 'react';
import { getFirestore, collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../lib/firebase';
import { FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';

const db = getFirestore(app);

function Reminder() {
  const [reminders, setReminders] = useState([]);
  const [input, setInput] = useState('');
  const user = getAuth().currentUser;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setReminders(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddReminder = async () => {
    if (!input.trim() || !user) return;

    await addDoc(collection(db, 'reminders'), {
      text: input,
      time: new Date().toLocaleTimeString(),
      timestamp: serverTimestamp(),
      userId: user.uid
    });

    setInput('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'reminders', id));
  };

  return (
    <div className='reminder-container'>
      <div className="reminder-input-box">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a reminder..."
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleAddReminder}
          className="reminder-add"
        >
          <FaPlus />
        </motion.button>
      </div>
      <ul className="reminder-list">
        <AnimatePresence>
          {reminders.map((reminder) => (
            <motion.li
              key={reminder.id}
              className="reminder-list-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <span>{reminder.text} ({reminder.time})</span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => handleDelete(reminder.id)}
                className="delete-btn-reminder"
              >
                <MdDelete />
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

export default Reminder;

'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import GeminiChat from '../../components/GeminiChat';
import FitnessGoal from '../../components/FitnessGoal';
import Reminder from '@/components/Reminder';
import WeatherAdvice from '@/components/WeatherAdvice';
import BreathingTimer from '@/components/BreathingTimer';
import {useRouter} from 'next/router';


const tabs = [
  { id: 'health', label: 'Health Advisor', component: <GeminiChat /> },
  { id: 'fitness', label: 'Fitness Planner', component: <FitnessGoal /> },
  { id: 'reminder', label: 'Reminder', component: <Reminder /> },
  { id: 'weather', label: 'Weather Advice', component: <WeatherAdvice /> },
  { id: 'breathing', label: 'Breathing Timer', component: <BreathingTimer /> },
];

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('health');
  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if(user==null){
      router.push('/login');
    }
  }, [user])


  return (
    <main className='main-body'>
      {user ? (
        <>
          <div className='toggle-container'>
            <div className='toggle-wrapper'>
              {tabs.map((tab) => (
                <span
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: activeTab === tab.id ? 'black' : 'transparent'
                  }}
                >
                  {tab.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            {activeComponent}
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center' }}>Please log in to use AI features.</p>
      )}
    </main>
  );
}

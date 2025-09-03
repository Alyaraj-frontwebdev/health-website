'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import GeminiChat from '../../components/GeminiChat';
import FitnessGoal from '../../components/FitnessGoal';
import WeatherAdvice from '@/components/WeatherAdvice';
import { useRouter } from 'next/navigation';


const tabs = [
  { id: 'health', label: 'Health Advisor', component: <GeminiChat /> },
  { id: 'fitness', label: 'Fitness Planner', component: <FitnessGoal /> },
  { id: 'weather', label: 'AQI Advisor', component: <WeatherAdvice /> },
];

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('health');
  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const [menuOpen, setMenuOpen] = useState(false);



  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');// Redirect to login or landing page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  return (
    <main className="main-body">
      {user ? (
        <>
          <header className="navbar">
            <div className="heal-logo">AI Health</div>

            <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
              {tabs.map((tab) => (
                <span
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setMenuOpen(false)
                  }}
                  className={activeTab === tab.id ? 'active' : ''}
                >
                  {tab.label}
                </span>
              ))}
            </nav>

            <div className="actions">
              <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </header>

          <div style={{marginTop: '56px'}}>{activeComponent}</div>
        </>
      ) : (
        <p style={{ textAlign: 'center' }}>Please log in to use AI features.</p>
      )}
    </main>

  );
}

'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function BreathingTimer() {


    const [count, setCount] = useState(0);
    const [phase, setPhase] = useState('Ready');

    useEffect(() => {
        let interval;
        if (phase !== 'Ready') {
            interval = setInterval(() => {
                setCount((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [phase]);

    useEffect(() => {
        if (phase === 'Inhale' && count >= 4) {
            setPhase('Hold');
            setCount(0);
        } else if (phase === 'Hold' && count >= 7) {
            setPhase('Exhale');
            setCount(0);
        } else if (phase === 'Exhale' && count >= 8) {
            setPhase('Inhale');
            setCount(0);
        }
    }, [count, phase]);

    const startBreathing = () => {
        setPhase('Inhale');
        setCount(0);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '70vh'
        }}>
            <div className='breathing-content'>
                <h1 className="" style={{ color: 'white' }}>Breathing Timer (4-7-8)</h1>
                <button
                    onClick={startBreathing}
                    className=""
                >
                    Start
                </button>
                <div className="phase" style={{ color: 'white' }}>{phase}</div>
                <div className="count" style={{ color: 'white' }}>{count}s</div>
            </div>
            <div>
                <Image src='/breathingImage.png' alt='breathingImage' width={500} height={650} className='breathingAnimation' />
            </div>
        </div>
    )
}

export default BreathingTimer


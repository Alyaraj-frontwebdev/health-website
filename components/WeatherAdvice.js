'use client';
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

function WeatherAdvice() {
    const [weather, setWeather] = useState(null);
    const [aqiAdvice, setAqiAdvice] = useState('');
    const [aqi, setAqi] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const dataItems = [
        { label: 'Temperature', value: `${weather?.temperature}°C` },
        { label: 'PM2.5 AQI', value: `${aqi} µg/m³` },
        { label: 'Wind Speed', value: `${weather?.windspeed} km/h` },
    ];

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
            );
            const weatherData = await weatherRes.json();
            setWeather(weatherData.current_weather);

            const aqiRes = await fetch(
                `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5`
            );
            const aqiData = await aqiRes.json();
            const pm25 = aqiData.hourly.pm2_5[0];
            setAqi(pm25);

            const prompt = `The PM2.5 level in my area is ${pm25}. Give health-related advice accordingly.`;
            const aiRes = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const aiData = await aiRes.json();
            setAqiAdvice(aiData.text);
        });
    }, []);

    if (!weather || aqi === null) {
        return (
            <div className="weather-loading">
                <p>Loading weather and air quality...</p>
                <small>Please allow location access</small>
            </div>
        );
    }

    return (
        <div className="weather-wrapper">
            {/* Left Circular Toggle */}
            <div className="circle-section">
                <div className="circle">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="circle-text"
                        >
                            <div className="value">{dataItems[activeIndex].value}</div>
                            <div className="label">{dataItems[activeIndex].label}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="toggle-buttons">
                    {dataItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={activeIndex === index ? 'active' : ''}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right AI Advice */}
            <div className="advice-section">
                <h3>AI Health Advice</h3>
                <div className="advice-box">
                    <ReactMarkdown>{aqiAdvice}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

export default WeatherAdvice;

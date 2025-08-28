'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import appLogo from '../public/appLogo.jpeg';
import fitnessPlan from '../public/AIFitnessPlanner.jpeg';
import aiAdvice from '../public/AIHealthAdvisor.jpeg';
import aqiadvisor from '../public/aqiadvisor.jpeg';
import { Analytics } from "@vercel/analytics/next"
export default function Home() {

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut', delay: i * 0.15 }
    })
  };
  const slide = {
    hidden: { opacity: 0, x: 100 },
    visible: (i = 0) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut', delay: i * 0.15 }
    })
  }

  return (
    <>
      {/* -------- Header -------- */}
      <Analytics/>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='landing-header'
      >
        <h2 style={{ fontSize: '1.6rem', fontWeight: 500, color: "black" }}>Healieve.</h2>

      </motion.header>

      {/* -------- Hero Section -------- */}
      <motion.section
        className="hero"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className='hero-wrapper'>
          <motion.h1 variants={fadeUp}>
            Smarter&nbsp;Health.<br />Tailored&nbsp;Fitness.
          </motion.h1>

          <motion.p variants={fadeUp} custom={1}>
            Ask AI for quick health advice and generate personalised fitness goals —
            all beautifully packaged for you to download.
          </motion.p>

          <motion.div variants={fadeUp} custom={2} >
            <Link href='/signup'>
              <button className="cta">🚀 Try&nbsp;Now</button>
            </Link>
          </motion.div>
        </div>
        <div>
          <Image src={appLogo} alt='Logo' className='logo' />
        </div>
      </motion.section>

      {/* -------- Features Section -------- */}
      <motion.section
        viewport={{ once: true, amount: 0.2 }}
        style={{ marginTop: '3rem' }}
      >
        <motion.h1 style={{ fontSize: '5rem', fontWeight: 200, marginLeft: '5%' , color: "black"}}>Our Features</motion.h1>
        <motion.div className="features">
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: '5rem', justifyContent: 'center' }} className='feat1content' variants={slide} initial="hidden"
            whileInView="visible">
            <motion.div className='featureContent' >
              <motion.h1 style={{ fontSize: '3rem', fontWeight: 200, color: "black" }}> AI Health Advisor</motion.h1>
              <motion.p style={{color: "black"}}>The AI Health Advisor is your personal, always-available health assistant. It’s designed to make basic health guidance accessible, fast, and reliable. Instead of endlessly searching online for answers to common issues, you can simply ask the AI a question in plain language and receive thoughtful, easy-to-understand advice instantly. Whether you're dealing with a mild headache, a sore throat, stomach discomfort, or general fatigue, the AI offers suggestions based on real medical knowledge, helping you decide whether to rest, hydrate, adjust your diet, or consult a professional. It’s built on Google’s Gemini 2.0, ensuring responses are intelligent, relevant, and context-aware. You can also ask questions about nutrition, mental well-being, hydration, sleep, or lifestyle habits, and get recommendations tailored to your query. The AI does not replace medical professionals, but it provides a smart first step when you need clarity. Best of all, your conversations are securely saved using Firebase Authentication, so you can revisit past discussions anytime. The AI Health Advisor is perfect for students, busy professionals, and anyone looking for trusted, on-demand answers without the noise. With just a few taps, you gain quick insights into your symptoms and daily health choices, helping you take better care of yourself, one question at a time.</motion.p>
            </motion.div>
            <motion.div>
              <Image src={aiAdvice} alt='AI Health Advice' className='feat1image' />
            </motion.div>
          </motion.div>
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: '5rem', justifyContent: 'center' }} className='feat2content' variants={slide} initial="hidden"
            whileInView="visible">
            <motion.div className='featureContent'>
              <motion.h1 style={{ fontSize: '3rem', fontWeight: 200 , color: "black"}}>Personalized Fitness Goal Generator</motion.h1>
              <motion.p style={{color: "black"}}>The Personalized Fitness Goal Generator is designed to give you a clear, customized fitness roadmap without the need for expensive trainers or guesswork. It starts by asking for a few simple details: your age, gender, height, weight, diet preference, body type, and fitness goal—whether you want to lose fat, gain muscle, or maintain a healthy lifestyle. Using this information, the system leverages the power of Gemini 2.0 to generate a tailored fitness and nutrition plan just for you. In seconds, you’ll receive a full workout routine and meal guidance based on your personal profile. The plan is structured, realistic, and focused on sustainable progress rather than shortcuts. What makes it even more helpful is that the entire plan is formatted into a clean, downloadable PDF that you can refer to anytime on your phone or print out for easy tracking. Unlike generic plans found online, this one is made with your specific goals in mind, so you’re never left wondering what to do next. It’s ideal for beginners who want a clear start and for anyone looking to take control of their body in a smart, data-driven way. HealthAI makes planning your fitness journey as simple as answering a few questions.</motion.p>
            </motion.div>
            <motion.div>
              <Image src={fitnessPlan} alt='AI Fitness Plan' className='feat2image' />
            </motion.div>
          </motion.div>
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: '5rem', justifyContent: 'center' }} className='feat2content' variants={slide} initial="hidden"
            whileInView="visible">
            <motion.div className='featureContent' variants={slide} >
              <motion.h1 style={{ fontSize: '3rem', fontWeight: 200, color: "black" }}>AQI Advisor</motion.h1>
              <motion.p style={{color: "black"}}>Breathe better with real-time air quality guidance. Our AQI Advisor feature uses your location to instantly check the Air Quality Index (AQI) in your area, along with current weather conditions and wind speed. But it doesn’t stop there—powered by Gemini 2.0, it goes a step further by analyzing the air quality and giving you personalized health advice based on your environment. Whether the air is safe, moderate, or heavily polluted, you’ll get clear, actionable suggestions—like “Wear a mask before heading out,” “Avoid outdoor exercise today,” or “It’s a good day for a walk.” This feature helps protect you and your loved ones, especially if you have respiratory conditions, allergies, or just want to stay safe during high pollution days.</motion.p>
            </motion.div>
            <motion.div>
              <Image src={aqiadvisor} alt='AI Fitness Plan' className='feat4image' />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* -------- Footer -------- */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        © 2025 Healieve&nbsp;·&nbsp;All&nbsp;rights&nbsp;reserved
      </motion.footer>
    </>
  );
}

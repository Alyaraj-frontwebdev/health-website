'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithRedirect, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import signupLogo from '../../public/sign-up-image.png';
import googleLogo from '../../public/google-logo.png';
import appLogo from '../../public/appLogo.jpeg';
import Image from 'next/image';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      router.push('/app');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignup = async () => {
     try {
    // Try signInWithPopup first
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Popup login successful:", result.user);
    router.push("/app");
  } catch (popupError) {
    // If popup blocked (common on mobile), fallback to redirect
    console.warn("Popup failed, falling back to redirect:", popupError);
    await signInWithRedirect(auth, googleProvider);
  }
  };

  return (
    <div className="auth-container">
      <div className='auth-wrapper'>
        <div className='main-signup'>
          <h3 style={{display:'flex', alignItems: 'center', gap: '0.8rem', color: 'black'}}><Image src={appLogo} width={36} height={38} style={{borderRadius: '50%'}} alt='App Name'/>Healieve</h3>
          <h2 style={{color: 'black'}}>Let's Get Started</h2>
          <div className='signup-form'>
            <input type="text" placeholder="Full Name" onChange={e => setFullName(e.target.value)} />
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button className='signup-btn' onClick={handleSignup}>SIGN UP</button>
            <span style={{ fontFamily: 'inherit', color: 'black' }}>-------------Or--------------</span>
            <button className='google-btn' onClick={handleGoogleSignup}><Image src={googleLogo} alt="Google" width={30} height={30} /> Sign Up with Google</button>
            <p style={{color: 'black'}}>Already have an account? <Link href="/login">Login</Link></p>
          </div>
        </div>
        <div className='signup-img-container'>
          <Image src={signupLogo} alt="Sign-up" />
        </div>
      </div>
    </div>
  );
}

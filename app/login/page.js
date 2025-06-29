'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import loginLogo from '../../public/login-image.png';
import googleLogo from '../../public/google-logo.png';
import appLogo from '../../public/appLogo.jpeg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // ✅ Redirect if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/app');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ Handle redirect login (Google)
  useEffect(() => {
    const checkGoogleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          router.push('/app');
        }
      } catch (error) {
        console.error("Redirect login failed", error);
      }
    };
    checkGoogleRedirect();
  }, [router]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/app'); // Redirect on success
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className='auth-wrapper'>
        <div className='main-signup'>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Image src={appLogo} width={36} height={38} style={{ borderRadius: '50%' }} alt='App Name' />
            Healieve
          </h3>
          <h2>Welcome Back</h2>
          <div className='signup-form'>
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button className='signup-btn' onClick={handleLogin}>LOGIN</button>
            <span>------------------Or---------------------</span>
            <button className='google-btn' onClick={handleGoogleLogin}>
              <Image src={googleLogo} alt="Google" width={30} height={30} />
              Continue with Google
            </button>
            <p>Don’t have an account? <Link href="/signup">Sign up</Link></p>
          </div>
        </div>
        <div className='signup-img-container'>
          <Image src={loginLogo} alt="Login" width={400} height={400} style={{ padding: '20px 50px' }} />
        </div>
      </div>
    </div>
  );
}

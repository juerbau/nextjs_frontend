// app/login/page.jsx
'use client';

import React, {useState} from 'react';
//import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/utils/fetchWithAuth';

//import Link from "next/link";


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const router = useRouter();
    const [loginStatus, setLoginStatus] = useState(false);


    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        // 1. Zuerst das CSRF-Cookie bei Laravel anfordern
        // Dies ist der kritische Initial-Aufruf, um die Session zu initialisieren.
        try {
            await fetch('http://localhost:8000/sanctum/csrf-cookie', {credentials: 'include'});
            console.log('✅ CSRF-Cookie erfolgreich angefordert und Session initialisiert.');
        } catch (csrfError) {
            setError('Fehler bei der Initialisierung der Session.');
            console.error(csrfError);
            return;
        }

        try {
            const res = await fetchWithAuth('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.message ?? `Login failed (${res.status})`);
                return;
            }

            console.log('Login successful');
            console.log('login status:', res.status);
            setLoginStatus(true);

        } catch (err) {
            // ❌ Netzwerk / CORS / JS-Fehler
            setError('Netzwerkfehler. Bitte später erneut versuchen.');
            console.error(err);
        }


    };

    async function handleLogout(){

        try {
            const res = await fetchWithAuth('http://localhost:8000/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.message ?? `Logout failed (${res.status})`);
                return;
            }

            console.log('Logout successful');
            setLoginStatus(false);

        } catch (err) {
            setError('Netzwerkfehler beim Logout.');
            console.error(err);
        }
    }


    async function handleGetUser(){
        const res = await fetchWithAuth('http://localhost:8000/api/user');
        if(res.ok){
            const data = await res.json();
            console.log(data.name);
        }
    }


    return (
        <div style={{padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc'}}>
            {loginStatus && (
                <>
                    <button type='button' onClick={handleGetUser}>GetUser</button>
                    <button type='button' onClick={handleLogout}>Logout</button>
                </>
            )}
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                {error && <p style={{color: 'red'}}>{error}</p>}

                <div>
                    <label htmlFor="email">E-Mail:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div style={{marginTop: '10px'}}>
                    <label htmlFor="password">Passwort:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {/*{loginStatus && <div><Link href='/dashboard'>Dashboard</Link></div>}*/}

                <button type="submit" style={{marginTop: '20px'}}>Login</button>
            </form>
        </div>
    );
}
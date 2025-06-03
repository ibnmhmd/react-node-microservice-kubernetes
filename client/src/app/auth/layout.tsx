import React from 'react';

export default function AuthLayout ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f7fafc'
        }}>
            <header style={{
                padding: '1.5rem 2rem',
                background: '#1a202c',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.5rem',
                letterSpacing: '1px'
            }}>
                Ticketing App
            </header>
            <main style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{
                    background: '#fff',
                    padding: '2rem 2.5rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    minWidth: '350px'
                }}>
                    {children}
                </div>
            </main>
            <footer style={{
                textAlign: 'center',
                padding: '1rem',
                background: '#edf2f7',
                color: '#4a5568',
                fontSize: '0.95rem'
            }}>
                &copy; {new Date().getFullYear()} Ticketing App. All rights reserved.
            </footer>
        </div>
    );
};
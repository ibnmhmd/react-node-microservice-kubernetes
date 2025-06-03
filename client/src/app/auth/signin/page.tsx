'use client';
// This file is part of a Next.js application using TypeScript and React.
import React, { useState } from 'react';
import useRequest from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

export default function SigninPage () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { doRequest, errors, hasError } = useRequest({
        url: '/api/users/signin',
        method: 'post',
        body: { data: { email, password } },
        onSuccess: () =>  router.push('/')
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle signup logic here
        doRequest();
    }
    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
            <h2 className="mb-4 text-center" style={{ color: 'black' }}>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label" style={{ color: 'black' }}>
                        Email address
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label" style={{ color: 'black' }}>
                        Password
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>
                {/* error message */}
                { hasError && (errors)}
                {/* end error message */}
        
                <button type="submit" className="btn btn-primary w-100">
                    Sign In
                </button>
            </form>
        </div>
    );
};

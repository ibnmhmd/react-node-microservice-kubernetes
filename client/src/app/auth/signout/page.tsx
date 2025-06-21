'use client';
// This file is part of a Next.js application using TypeScript and React.
import  { useEffect } from 'react';
import useRequest from '@/hooks/use-request';
import { useRouter } from 'next/navigation';

export default function SignoutPage () {

    const router = useRouter();
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: { data: { } },
        onSuccess: () =>  router.push('/')
    });

    useEffect(() => {
        // Automatically sign out when the component mounts
        doRequest();
    }, [doRequest]);

    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
            <h2 className="mb-4 text-center" style={{ color: 'black' }}>Signing Out...</h2>
            <p className="text-center" style={{ color: 'black' }}>You will be redirected shortly.</p>
        </div>
    );
};

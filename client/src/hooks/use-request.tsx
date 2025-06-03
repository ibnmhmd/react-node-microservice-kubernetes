import { JSX, useState } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

interface UseRequestProps {
    url: string;
    method: 'get' | 'post' | 'put' | 'delete' | 'patch';
    body?: AxiosRequestConfig<unknown>;
    onSuccess?: () => void;
}

const useRequest = ({ url, method, body, onSuccess }: UseRequestProps) => {
    const [errors, setErrors] = useState<JSX.Element | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const doRequest = async () => {
        setErrors(null);
        setLoading(true);
        try {
            method = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
            let response;
            if (['post', 'put', 'patch'].includes(method)) {
                response = await axios[method](
                    url,
                    body?.data ? body?.data : undefined
                );
            } else {
                response = await axios[method](url, body);
            }
            // If onSuccess callback is provided, call it with the response data
            setLoading(false);
            if (onSuccess) {
                onSuccess();
            }
            return response.data;
        } catch (error: unknown) {
            setLoading(false);

            let err: Array<{message: string}> = [{ message : '' }];

            if (axios.isAxiosError(error)) {
                err = error.response?.data.errors || [{ message: 'An unknown error occurred.' }];
                setHasError(true);
                renderErrors(err);
                return;
            } 
            
            if (error instanceof Error) {
                err = [{ message: error.message }];
                setHasError(true);  
                 renderErrors(err);
                return;
            } 
            err.push({message: 'An unknown error occurred during signup.' });
            setHasError(true);
            renderErrors(err);
        }
    };

    const renderErrors = (err: Array<{message: string }>) => {
        setErrors(
                <div className="alert alert-danger">
                    <h4>Ooops...</h4>
                    <ul className="my-0">
                        {err.map((e: {message: string}, idx: number) => (
                            <li key={idx}>{e.message ?? e.message}</li>
                        ))} 
                    </ul>
                </div>
            );
    }
        
    return { doRequest, errors, loading , hasError};
};

export default useRequest;
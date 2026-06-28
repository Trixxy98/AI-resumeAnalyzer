import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const requestJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {}),
            },
            ...options,
        });

        const data = await response.json();
        if (!response.ok) {
            const message = typeof data?.error === 'string' ? data.error : 'Request failed';
            throw new Error(message);
        }

        return data as T;
    };

    const checkAuth = async () => {
        setIsLoading(true);
        try {
            const timeoutMs = 5000;
            const result = await Promise.race([
                requestJson<{ user: {
                    id: string;
                    email: string;
                    first_name?: string;
                    last_name?: string;
                    created_at?: string;
                } | null }>('/api/auth/check'),
                new Promise<{ user: null }>((resolve) => {
                    setTimeout(() => resolve({ user: null }), timeoutMs);
                }),
            ]);

            if (result.user) {
                setUser({
                    id: result.user.id,
                    email: result.user.email,
                    firstName: result.user.first_name,
                    lastName: result.user.last_name,
                    createdAt: result.user.created_at || new Date().toISOString(),
                });
            } else {
                setUser(null);
            }   
        } catch (error) {
            console.error('Error checking auth:', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }   
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const data = await requestJson<{ user: {
                id: string;
                email: string;
                first_name?: string;
                last_name?: string;
                created_at: string;
            } }>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            setUser({
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                createdAt: data.user.created_at,
            });
        } finally {
            setIsLoading(false);
        }   
    };

    const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
        setIsLoading(true);
        try {
            const data = await requestJson<{ user: {
                id: string;
                email: string;
                first_name?: string;
                last_name?: string;
                created_at: string;
            } }>('/api/auth/signup', {
                method: 'POST',
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            setUser({
                id: data.user.id,
                email: data.user.email,
                firstName: data.user.first_name,
                lastName: data.user.last_name,
                createdAt: data.user.created_at,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await requestJson<{ success: boolean }>('/api/auth/logout', {
            method: 'POST',
        });
        setUser(null);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
















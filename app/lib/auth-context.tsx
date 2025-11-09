import React, { createContext, useContext, useState, useEffect } from 'react';
import {createUser, findUserByEmail, createSession, findSessionByToken, deleteSession, verifyPassword} from './auth';

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
    const [isLoading, setIsLoading] = useState(true);

    const getSessionToken = () => {
        return document.cookie
        .split('; ')
        .find(row => row.startsWith('session='))
        ?.split('=')[1];
    }

    const setSessionToken = (token: string, expiresAt: Date) => {
        const expires = expiresAt.toUTCString();
        document.cookie = `session=${token}; expires=${expires}; path=/; SameSite=Lax`;
    }

    const removeSessionToken = () => {
        document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    }

    const checkAuth = async () => {
        try {
            const token = getSessionToken();
            if (!token) {
                setIsLoading(false);
                return;
            }

            const session = await findSessionByToken(token);
            if (session) {
                setUser({
                    id: session.user_id,
                    email: session.email,
                    firstName: session.first_name,
                    lastName: session.last_name,
                    createdAt: session.created_at,
                });
            } else {
                removeSessionToken();
            }   
        } catch (error) {
            console.error('Error checking auth:', error);
            removeSessionToken();
        } finally {
            setIsLoading(false);
        }   
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const userData = await findUserByEmail(email);
            if (!userData) {
                throw new Error('Invalid email or password');
            }

            const isValidPassword = await verifyPassword(password, userData.password_hash);
            if (!isValidPassword) {
                throw new Error('Invalid email or password');
            }

            const session = await createSession(userData.id);
            setSessionToken(session.token, session.expires_at);

            setUser({
                id: userData.id,
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
                createdAt: userData.created_at,
            });
        } finally {
            setIsLoading(false);
        }   
    };

    const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
        setIsLoading(true);
        try {
            const userData = await createUser(email, password, firstName, lastName);
            const session = await createSession(userData.id);
            setSessionToken(session.token, session.expires_at);

            setUser({
                id: userData.id,
                email: userData.email,
                firstName: userData.first_name,
                lastName: userData.last_name,
                createdAt: userData.created_at,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        const token = getSessionToken();
        if (token) {
            await deleteSession(token);
        }
        removeSessionToken();
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
















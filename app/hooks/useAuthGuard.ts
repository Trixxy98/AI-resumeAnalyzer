import { useEffect } from "react";
import {useNavigate} from "react-router";
import { usePuterStore } from "~/lib/puter";

export function useAuthGuard(redirectTo?: string){
    const {auth, isLoading} = usePuterStore();
    const navigate = useNavigate();

    useEffect(()=> {
        if(!isLoading) return;
        if(!auth.isAuthenticated) {
            const next = redirectTo ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
            navigate(`/auth?next=${encodeURIComponent(next)}`);
        }
    }, [isLoading, auth.isAuthenticated]);

}
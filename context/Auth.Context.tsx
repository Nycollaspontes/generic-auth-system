import Router from 'next/router'

import { createContext, ReactNode, useEffect, useState } from 'react';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { api } from '../services/apiClient';

type User = {
    email: string;
    permissions: string[];
    roles: string[];

}

type signInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: signInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user?: User;
}

type AuthProviderProps = {
    children: ReactNode;
}



export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
    destroyCookie(undefined, 'nextauth.token');
    destroyCookie(undefined, 'nextauth.refreshToken')

    Router.push('/')
}



export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>();
    // const router = useRouter();


    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'nextauth.token': token } = parseCookies();

        if (token) {
            api.get('/me').then(response => {
                console.log(response)
                const { email, permissions, roles } = response.data;

                setUser({ email, permissions, roles });
            })
                .catch(() => {
                     if(typeof window !== 'undefined') {
                        signOut();
                    }
                })
        }
    }, [])


    async function signIn({ email, password }: signInCredentials) {
        try {
            const response = await api.post('/sessions', {
                email,
                password
            })

            const { permissions, roles, token, refreshToken } = response.data;

            setCookie(undefined, 'nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30, //30 days,
                path: '/',
            })
            setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, //30 days,
                path: '/',
            })

            setUser({
                email,
                permissions,
                roles,
            })

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`

            Router.push('/dashboard')
        }
        catch (err) {
            console.log(err)
        }
    }


    return (
        <AuthContext.Provider value={{ user, signIn, isAuthenticated }} >
            {children}
        </AuthContext.Provider>
    )
}
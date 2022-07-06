import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/Auth.Context';


let isRefreshing = false;
let failedRequestQueue = [];


export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx);
    
    const api = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['nextauth.token']}`
        }
    });


    api.interceptors.response.use(response => {
        return response;
    }, (error) => {
        // console.log(error.response.status)
        // console.log(error.response)
        if (error.response.status = 401) {
            if (error.response.data?.code === 'token.expired') {
                // renovar o token, ou seja, RefreshTOken
                cookies = parseCookies(ctx); //atualizar os cookies sempre que fizer algo

                const { 'nextauth.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config;

                if (!isRefreshing) {
                    isRefreshing = true;

                    api.post('/refresh', {
                        refreshToken,
                    }).then(response => {
                        console.log(response.data);
                        const { token } = response.data;

                        setCookie(ctx, 'nextauth.token', token, {
                            maxAge: 60 * 60 * 24 * 30, //30 days,
                            path: '/',
                        })
                        setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, //30 days,
                            path: '/',
                        })

                        failedRequestQueue.forEach(request => request.onSucess(token))
                        failedRequestQueue = [];
                    })
                        .catch(err => {
                            failedRequestQueue.forEach(request => request.onFailure(err))
                            failedRequestQueue = [];
                            if(typeof window !== 'undefined'){
                                signOut();
                            }
                        })
                        .finally(() => {
                            isRefreshing = false;
                        })
                    return new Promise((resolve, reject) => {
                        failedRequestQueue.push({
                            onSucess: (token: string) => {
                                originalConfig.headers['Authorization'] = `Bearer ${token}`
                                resolve(api(originalConfig))
                            },
                            onFailure: (err: AxiosError) => {
                                reject(err);
                            },
                        })
                    });
                }
                else {

                }


            }
        }
        else {
            if(typeof window !== 'undefined') {
                signOut();
            }
        }

        return Promise.reject(error);
    });
    return api
}
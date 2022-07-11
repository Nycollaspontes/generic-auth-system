import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokentError } from "../services/errors/AuthTokenError";

export function WithSSRAuth<P>(fn: GetServerSideProps<P>) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

        const cookies = parseCookies(ctx);
        const token = cookies['nextauth.token'];

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }
        try {
            return await fn(ctx);
        } catch (err) {
            if (err instanceof AuthTokentError) {

                destroyCookie(ctx, 'nextauth.token')
                destroyCookie(ctx, 'nextauth.refreshToken')

                console.log(err);
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    }
                }
            }
        }
        return {
            redirect: {
                destination: '/error',
                permanent: false
            }
        }
    }
}
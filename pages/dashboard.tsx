import { useContext, useEffect } from "react";
import { AuthContext } from "../context/Auth.Context";
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/api";

import { WithSSRAuth } from "../utils/withSSRAuth";
import { AuthTokentError } from "../services/errors/AuthTokenError";
import { destroyCookie } from "nookies";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api
      .get("/me")
      // .then((response) => console.log(response))

      .catch((err) => console.log(err));
  });

  return (
    <div>
      <h1>Dashboard {user?.email}</h1>
    </div>
  );
}

export const getServerSideProps = WithSSRAuth(async (ctx) => {

  const apiClient = setupAPIClient(ctx);
  try {
    const response = await apiClient.get("/me");
  }
  catch (err) {
    destroyCookie(ctx,'nextauth.token')
    destroyCookie(ctx,'nextauth.refreshToken')
    
    console.log(err);
    return {
      redirect: {
        destination: '/',
        permanent : false,
      }
    }
  }
  return {
    props: {},
  }
});

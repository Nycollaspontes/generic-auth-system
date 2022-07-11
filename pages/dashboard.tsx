import { useContext, useEffect } from "react";
import { AuthContext } from "../context/Auth.Context";
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/api";

import { WithSSRAuth } from "../utils/withSSRAuth";
import { useCan } from "../hooks/canUse";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    roles: ['administrator' , 'editor']
  })

  useEffect(() => {
    api
      .get("/me")
      // .then((response) => console.log(response))

      .catch((err) => console.log(err));
  });

  return (
    <div>
      <h1>Dashboard {user?.email}</h1>
      <div>
        {userCanSeeMetrics && <h1>Metricas</h1>}
      </div>
    </div>
  );
}

export const getServerSideProps = WithSSRAuth(async (ctx) => {

  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get("/me");

  console.log(response.data);
  return {
    props: {

    },
  }
});

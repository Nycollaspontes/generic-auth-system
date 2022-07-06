import { useContext, useEffect } from "react";
import { AuthContext } from "../context/Auth.Context";
import { api } from "../services/apiClient";

import { WithSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard(){

    useEffect( () => {
        api.get('/me').then(response => console.log(response))


        .catch(err =>  console.log(err))
    })

    
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h1>Dashboard {user?.email}</h1>            
        </div>
    )
}


export const getSeverSideProps = WithSSRAuth(async (ctx) =>  {
    const response = await api.get('/me');

    console.log(response);

return {
    props:{}
}
})
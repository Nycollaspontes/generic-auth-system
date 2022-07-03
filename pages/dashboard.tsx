import { useContext, useEffect } from "react";
import { AuthContext } from "../context/Auth.Context";
import { api } from "../services/api";

export default function Dashboard(){

    useEffect( () => {
        api.get('/me').then(response => console.log(response.data))
    })

    
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h1>Dashboard {user?.email}</h1>            
        </div>
    )
}
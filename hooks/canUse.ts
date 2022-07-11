import { useContext } from 'react';
import { AuthContext } from '../context/Auth.Context';
type UseCanParams = {
    permissions?: string[];
    roles?: string[];
}

export function useCan({ permissions, roles }: UseCanParams) {
    const { user, isAuthenticated } = useContext(AuthContext)
    // condicoes de estar autenticado e de ter todas as permissoes 
    if (!isAuthenticated) {
        return false;
    }

    if (permissions?.length > 0) {
        const hasAllPermissions = permissions.every(permission => {
            return user.permissions.includes(permission)
        });
        if (!hasAllPermissions) {
            return false;
        }
    }
    // condicaoo de ter todas as roles 
    if (!isAuthenticated) {
        return false;
    }

    if (roles?.length > 0) {
        const hasAllRoles = permissions.some(role => {
            return user.permissions.includes(role)
        });
        if (!hasAllRoles) {
            return false;
        }
    }

    return true;
}
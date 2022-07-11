export class AuthTokentError extends Error {
    constructor() {
        super('Error with authentication token.')
    }
}
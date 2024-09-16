import { deleteMe } from './apis/deleteMe'
import { updateEmail } from './apis/updateEmail'
import { updateUser } from './apis/updateUser'

export type ApiOptions = {
    authUrl: string
}

export type PropelAuthApi = ReturnType<typeof getApis>

export const getApis = ({ authUrl: unvalidatedAuthUrl }: ApiOptions) => {
    const authUrl = validateAuthUrl(unvalidatedAuthUrl)
    return {
        deleteMe: deleteMe(authUrl),
        updateEmail: updateEmail(authUrl),
        updateUser: updateUser(authUrl),
    }
}

const validateAuthUrl = (authUrl: string) => {
    try {
        return new URL(authUrl).origin
    } catch {
        throw new Error('Invalid authUrl')
    }
}

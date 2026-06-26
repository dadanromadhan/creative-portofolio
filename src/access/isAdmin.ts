import type { Access } from 'payload'

export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user)
}

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user) return true
  return false
}

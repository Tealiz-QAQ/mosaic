import { Navigate, useSearchParams } from 'react-router-dom'

export default function NavigateWithParams({ to }: { to: string }) {
  const [params] = useSearchParams()
  return <Navigate to={{ pathname: to, search: `?${params.toString()}` }} />
}

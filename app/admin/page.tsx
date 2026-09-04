import { cookies } from 'next/headers';
import { ADMIN_COOKIE, sessionTokenIsValid } from '../../lib/admin-auth';
import AdminEditor from './AdminEditor';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  let authenticated = false;

  try {
    authenticated = sessionTokenIsValid(cookieStore.get(ADMIN_COOKIE)?.value);
  } catch {
    authenticated = false;
  }

  return authenticated ? <AdminEditor /> : <LoginForm />;
}

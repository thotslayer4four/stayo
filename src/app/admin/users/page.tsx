import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import UserRoleSelect from './UserRoleSelect'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, email, role, referral_code, created_at')
    .order('created_at', { ascending: false })

  const roleStyles: Record<string, string> = {
    admin: 'bg-amber-50 text-amber-700',
    host: 'bg-blue-50 text-blue-700',
    guest: 'bg-zinc-100 text-zinc-600',
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Users</h1>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {!users || users.length === 0 ? (
          <p className="px-6 py-12 text-sm text-zinc-400 text-center">No users yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['User', 'Referral code', 'Role', 'Joined', 'Change role'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-zinc-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs font-mono text-zinc-600">{u.referral_code ?? '—'}</code>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleStyles[u.role] ?? ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-4">
                      <UserRoleSelect userId={u.id} currentRole={u.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import PayoutDetailsForm from './PayoutDetailsForm'

export default async function PayoutDetailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('bank_name, bank_account_number, bank_account_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Payout details</h1>
        <p className="text-sm text-zinc-500 mb-8">
          Your earnings will be sent to this bank account. Stayo keeps 10% — you receive 90%.
        </p>
        <PayoutDetailsForm
          initialBankName={profile?.bank_name ?? ''}
          initialAccountNumber={profile?.bank_account_number ?? ''}
          initialAccountName={profile?.bank_account_name ?? ''}
        />
      </div>
    </div>
  )
}

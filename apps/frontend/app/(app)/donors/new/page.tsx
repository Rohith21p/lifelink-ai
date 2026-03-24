import { DonorForm } from '@/components/donors/donor-form';
import { PageTransition } from '@/components/ui/page-transition';

export default function CreateDonorPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Create Donor Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture donor eligibility, availability schedule, and donation preferences for matching workflows.
          </p>
        </section>
        <DonorForm mode="create" />
      </div>
    </PageTransition>
  );
}

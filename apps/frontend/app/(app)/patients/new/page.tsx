import { PatientForm } from '@/components/patients/patient-form';
import { PageTransition } from '@/components/ui/page-transition';

export default function CreatePatientPage() {
  return (
    <PageTransition>
      <div className="space-y-4">
        <section className="surface-soft p-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Create Patient Case</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a complete patient profile including medical summary, request context, and guardian contact.
          </p>
        </section>
        <PatientForm mode="create" />
      </div>
    </PageTransition>
  );
}

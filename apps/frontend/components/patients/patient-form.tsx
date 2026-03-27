'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/error';
import { patientsApi } from '@/lib/api/endpoints';
import { useReferenceDirectory } from '@/lib/hooks/use-reference-directory';
import { CreatePatientPayload, Patient } from '@/lib/types/api';
import { caseStatusOptions, genderOptions, organOptions, urgencyOptions } from '@/lib/types/options';

type PatientFormProps = {
  mode: 'create' | 'edit';
  initialPatient?: Patient;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidRegex.test(value);
}

function toDateInput(value?: string) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export function PatientForm({ mode, initialPatient }: PatientFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const referenceQuery = useReferenceDirectory();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState(() => ({
    hospitalId: initialPatient?.hospitalId ?? '',
    coordinatorId: initialPatient?.coordinatorId ?? '',
    uhid: initialPatient?.uhid ?? '',
    fullName: initialPatient?.fullName ?? '',
    age: String(initialPatient?.age ?? 0),
    gender: initialPatient?.gender ?? 'MALE',
    bloodGroup: initialPatient?.bloodGroup ?? '',
    city: initialPatient?.city ?? '',
    district: initialPatient?.district ?? '',
    state: initialPatient?.state ?? '',
    organNeeded: initialPatient?.organNeeded ?? 'KIDNEY',
    urgencyLevel: initialPatient?.urgencyLevel ?? 'MEDIUM',
    caseStatus: initialPatient?.caseStatus ?? 'NEW',
    requestActive: initialPatient?.requestActive ?? true,
    diagnosis: initialPatient?.medicalProfile?.primaryDiagnosis ?? '',
    comorbidities: initialPatient?.medicalProfile?.comorbidities ?? '',
    heightCm: String(initialPatient?.medicalProfile?.heightCm ?? ''),
    weightKg: String(initialPatient?.medicalProfile?.weightKg ?? ''),
    allergies: initialPatient?.medicalProfile?.allergies ?? '',
    medication: initialPatient?.medicalProfile?.currentMedication ?? '',
    lastAssessmentDate: toDateInput(initialPatient?.medicalProfile?.lastAssessmentDate),
    requiredBy: toDateInput(initialPatient?.request?.requiredBy),
    hospitalPriority: String(initialPatient?.request?.hospitalPriority ?? 3),
    requestNotes: initialPatient?.request?.notes ?? '',
    guardianName: initialPatient?.guardians?.[0]?.fullName ?? '',
    guardianRelation: initialPatient?.guardians?.[0]?.relation ?? '',
    guardianPhone: initialPatient?.guardians?.[0]?.phone ?? '',
    guardianEmail: initialPatient?.guardians?.[0]?.email ?? '',
  }));

  const hospitalOptions = useMemo(() => {
    const options = [...referenceQuery.hospitalOptions];

    if (form.hospitalId && !options.some((option) => option.value === form.hospitalId)) {
      options.unshift({
        value: form.hospitalId,
        label: `Current Hospital (${form.hospitalId.slice(0, 8)})`,
      });
    }

    return options;
  }, [form.hospitalId, referenceQuery.hospitalOptions]);

  const coordinatorOptions = useMemo(() => {
    const filtered = referenceQuery.coordinatorOptions.filter(
      (option) => !form.hospitalId || !option.hospitalId || option.hospitalId === form.hospitalId,
    );

    if (form.coordinatorId && !filtered.some((option) => option.value === form.coordinatorId)) {
      filtered.unshift({
        value: form.coordinatorId,
        label: `Current Coordinator (${form.coordinatorId.slice(0, 8)})`,
      });
    }

    return filtered;
  }, [form.coordinatorId, form.hospitalId, referenceQuery.coordinatorOptions]);

  useEffect(() => {
    if (mode !== 'create' || form.hospitalId || !referenceQuery.hospitalOptions.length) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      hospitalId: referenceQuery.hospitalOptions[0].value,
    }));
  }, [form.hospitalId, mode, referenceQuery.hospitalOptions]);

  useEffect(() => {
    setForm((previous) => {
      const filtered = referenceQuery.coordinatorOptions.filter(
        (option) => !previous.hospitalId || !option.hospitalId || option.hospitalId === previous.hospitalId,
      );

      if (
        filtered.length > 0 &&
        previous.coordinatorId &&
        !filtered.some((option) => option.value === previous.coordinatorId)
      ) {
        return {
          ...previous,
          coordinatorId: '',
        };
      }

      if (mode === 'create' && !previous.coordinatorId && filtered.length > 0) {
        return {
          ...previous,
          coordinatorId: filtered[0].value,
        };
      }

      return previous;
    });
  }, [form.hospitalId, mode, referenceQuery.coordinatorOptions]);

  const mutation = useMutation({
    mutationFn: async (payload: CreatePatientPayload) => {
      if (mode === 'create') {
        return patientsApi.create(payload);
      }

      return patientsApi.update(initialPatient?.id ?? '', payload);
    },
    onMutate: () => {
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(
          error,
          mode === 'create'
            ? 'Unable to create patient right now. Please retry.'
            : 'Unable to update patient right now. Please retry.',
        ),
      );
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      const patientId = mode === 'create' ? response.id : initialPatient?.id;
      const statusQuery = mode === 'create' ? '?created=1' : '?updated=1';
      router.push(patientId ? `/patients/${patientId}${statusQuery}` : '/patients');
      router.refresh();
    },
  });

  const payload = useMemo<CreatePatientPayload>(
    () => ({
      hospitalId: form.hospitalId,
      coordinatorId: form.coordinatorId || undefined,
      uhid: form.uhid,
      fullName: form.fullName,
      age: Number(form.age || 0),
      gender: form.gender as CreatePatientPayload['gender'],
      bloodGroup: form.bloodGroup,
      city: form.city,
      district: form.district || undefined,
      state: form.state,
      organNeeded: form.organNeeded as CreatePatientPayload['organNeeded'],
      urgencyLevel: form.urgencyLevel as CreatePatientPayload['urgencyLevel'],
      caseStatus: form.caseStatus as CreatePatientPayload['caseStatus'],
      requestActive: form.requestActive,
      medicalProfile: {
        primaryDiagnosis: form.diagnosis,
        comorbidities: form.comorbidities || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
        weightKg: form.weightKg ? Number(form.weightKg) : undefined,
        allergies: form.allergies || undefined,
        currentMedication: form.medication || undefined,
        lastAssessmentDate: form.lastAssessmentDate || undefined,
      },
      request: {
        organType: form.organNeeded as CreatePatientPayload['request']['organType'],
        requiredBy: form.requiredBy || undefined,
        hospitalPriority: Number(form.hospitalPriority || 3),
        notes: form.requestNotes || undefined,
      },
      guardians: [
        {
          fullName: form.guardianName,
          relation: form.guardianRelation,
          phone: form.guardianPhone,
          email: form.guardianEmail || undefined,
          isPrimary: true,
        },
      ],
    }),
    [form],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.hospitalId) {
      setSubmitError('Please select a hospital before saving the patient.');
      return;
    }

    if (!isUuid(form.hospitalId)) {
      setSubmitError('Hospital ID must be a valid UUID. Please pick a valid hospital.');
      return;
    }

    if (form.coordinatorId && !isUuid(form.coordinatorId)) {
      setSubmitError('Coordinator ID must be a valid UUID when provided.');
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Core Patient Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="uhid">UHID</Label>
            <Input id="uhid" value={form.uhid} onChange={(e) => setForm({ ...form, uhid: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={form.gender}
              onChange={(value) => setForm({ ...form, gender: value as Patient['gender'] })}
              options={genderOptions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Input
              id="bloodGroup"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Organ Needed</Label>
            <Select
              value={form.organNeeded}
              onChange={(value) => setForm({ ...form, organNeeded: value as Patient['organNeeded'] })}
              options={organOptions}
            />
          </div>
          <div className="space-y-2">
            <Label>Urgency</Label>
            <Select
              value={form.urgencyLevel}
              onChange={(value) => setForm({ ...form, urgencyLevel: value as Patient['urgencyLevel'] })}
              options={urgencyOptions}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.caseStatus}
              onChange={(value) => setForm({ ...form, caseStatus: value as Patient['caseStatus'] })}
              options={caseStatusOptions}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospitalId">Hospital</Label>
            {hospitalOptions.length > 0 ? (
              <Select
                value={form.hospitalId}
                onChange={(value) => setForm({ ...form, hospitalId: value })}
                options={hospitalOptions}
                placeholder="Select hospital"
              />
            ) : (
              <Input
                id="hospitalId"
                value={form.hospitalId}
                onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                placeholder="Enter hospital UUID"
                required
              />
            )}
            <p className="text-xs text-muted-foreground">
              {referenceQuery.isLoading && hospitalOptions.length === 0
                ? 'Loading hospitals from existing records...'
                : 'Use a registered hospital ID to satisfy backend UUID validation.'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="coordinatorId">Coordinator (Optional)</Label>
            {coordinatorOptions.length > 0 ? (
              <Select
                value={form.coordinatorId}
                onChange={(value) => setForm({ ...form, coordinatorId: value })}
                options={coordinatorOptions}
                placeholder="Select coordinator (optional)"
              />
            ) : (
              <Input
                id="coordinatorId"
                value={form.coordinatorId}
                onChange={(e) => setForm({ ...form, coordinatorId: e.target.value })}
                placeholder="Enter coordinator UUID"
              />
            )}
          </div>
          {referenceQuery.isError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 md:col-span-2">
              Reference data could not be loaded. You can still continue using valid UUIDs.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="diagnosis">Primary Diagnosis</Label>
            <Input
              id="diagnosis"
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="comorbidities">Comorbidities</Label>
            <Textarea
              id="comorbidities"
              value={form.comorbidities}
              onChange={(e) => setForm({ ...form, comorbidities: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heightCm">Height (cm)</Label>
            <Input
              id="heightCm"
              type="number"
              value={form.heightCm}
              onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weightKg">Weight (kg)</Label>
            <Input
              id="weightKg"
              type="number"
              value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Input
              id="allergies"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medication">Current Medication</Label>
            <Textarea
              id="medication"
              value={form.medication}
              onChange={(e) => setForm({ ...form, medication: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastAssessmentDate">Last Assessment Date</Label>
            <Input
              id="lastAssessmentDate"
              type="date"
              value={form.lastAssessmentDate}
              onChange={(e) => setForm({ ...form, lastAssessmentDate: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request and Guardian</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="requiredBy">Required By</Label>
            <Input
              id="requiredBy"
              type="date"
              value={form.requiredBy}
              onChange={(e) => setForm({ ...form, requiredBy: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Hospital Priority (1-5)</Label>
            <Input
              id="priority"
              type="number"
              min={1}
              max={5}
              value={form.hospitalPriority}
              onChange={(e) => setForm({ ...form, hospitalPriority: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="requestNotes">Request Notes</Label>
            <Textarea
              id="requestNotes"
              value={form.requestNotes}
              onChange={(e) => setForm({ ...form, requestNotes: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Name</Label>
            <Input
              id="guardianName"
              value={form.guardianName}
              onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianRelation">Relation</Label>
            <Input
              id="guardianRelation"
              value={form.guardianRelation}
              onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianPhone">Phone</Label>
            <Input
              id="guardianPhone"
              value={form.guardianPhone}
              onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardianEmail">Email</Label>
            <Input
              id="guardianEmail"
              type="email"
              value={form.guardianEmail}
              onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Patient' : 'Update Patient'}
        </Button>
      </div>
    </form>
  );
}

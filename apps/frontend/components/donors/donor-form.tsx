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
import { donorsApi } from '@/lib/api/endpoints';
import { useReferenceDirectory } from '@/lib/hooks/use-reference-directory';
import { CreateDonorPayload, DonationType, Donor } from '@/lib/types/api';
import { donorStatusOptions, genderOptions } from '@/lib/types/options';

type DonorFormProps = {
  mode: 'create' | 'edit';
  initialDonor?: Donor;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validDonationTypes = new Set<DonationType>(['ORGAN', 'BLOOD', 'PLASMA']);

function isUuid(value: string) {
  return uuidRegex.test(value);
}

function toDateInput(value?: string) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDonationTypes(value: string): DonationType[] {
  return parseList(value)
    .map((item) => item.toUpperCase())
    .filter((item): item is DonationType => validDonationTypes.has(item as DonationType));
}

export function DonorForm({ mode, initialDonor }: DonorFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const referenceQuery = useReferenceDirectory();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState(() => ({
    hospitalId: initialDonor?.hospitalId ?? '',
    coordinatorId: initialDonor?.coordinatorId ?? '',
    donorCode: initialDonor?.donorCode ?? '',
    fullName: initialDonor?.fullName ?? '',
    age: String(initialDonor?.age ?? ''),
    gender: initialDonor?.gender ?? 'MALE',
    bloodGroup: initialDonor?.bloodGroup ?? '',
    city: initialDonor?.city ?? '',
    district: initialDonor?.district ?? '',
    state: initialDonor?.state ?? '',
    status: initialDonor?.status ?? 'AVAILABLE',
    lastDonationDate: toDateInput(initialDonor?.lastDonationDate),
    availableFrom: toDateInput(initialDonor?.availableFrom),
    bmi: String(initialDonor?.medicalProfile?.bmi ?? ''),
    medicalConditions: initialDonor?.medicalProfile?.medicalConditions ?? '',
    infectiousScreening: initialDonor?.medicalProfile?.infectiousDiseaseScreening ?? '',
    lastScreeningDate: toDateInput(initialDonor?.medicalProfile?.lastScreeningDate),
    medicalNotes: initialDonor?.medicalProfile?.notes ?? '',
    isAvailable: initialDonor?.availability?.isAvailable ?? true,
    availableDays: initialDonor?.availability?.availableDays?.join(', ') ?? '',
    preferredTimeWindow: initialDonor?.availability?.preferredTimeWindow ?? '',
    travelRadiusKm: String(initialDonor?.availability?.travelRadiusKm ?? ''),
    organDonationOptIn: initialDonor?.preference?.organDonationOptIn ?? true,
    bloodDonationOptIn: initialDonor?.preference?.bloodDonationOptIn ?? true,
    maxRequestsPerMonth: String(initialDonor?.preference?.maxRequestsPerMonth ?? 2),
    supportedDonationTypes: initialDonor?.preference?.supportedDonationTypes?.join(', ') ?? '',
    preferredHospitals: initialDonor?.preference?.preferredHospitals?.join(', ') ?? '',
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
    mutationFn: async (payload: CreateDonorPayload) => {
      if (mode === 'create') {
        return donorsApi.create(payload);
      }

      return donorsApi.update(initialDonor?.id ?? '', payload);
    },
    onMutate: () => {
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(
          error,
          mode === 'create'
            ? 'Unable to create donor right now. Please retry.'
            : 'Unable to update donor right now. Please retry.',
        ),
      );
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['donors'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      const donorId = mode === 'create' ? response.id : initialDonor?.id;
      const statusQuery = mode === 'create' ? '?created=1' : '?updated=1';
      router.push(donorId ? `/donors/${donorId}${statusQuery}` : '/donors');
      router.refresh();
    },
  });

  const payload = useMemo<CreateDonorPayload>(
    () => ({
      hospitalId: form.hospitalId,
      coordinatorId: form.coordinatorId || undefined,
      donorCode: form.donorCode,
      fullName: form.fullName,
      age: Number(form.age || 0),
      gender: form.gender as CreateDonorPayload['gender'],
      bloodGroup: form.bloodGroup,
      city: form.city,
      district: form.district || undefined,
      state: form.state,
      status: form.status as CreateDonorPayload['status'],
      lastDonationDate: form.lastDonationDate || undefined,
      availableFrom: form.availableFrom || undefined,
      medicalProfile: {
        bmi: form.bmi ? Number(form.bmi) : undefined,
        medicalConditions: form.medicalConditions || undefined,
        infectiousDiseaseScreening: form.infectiousScreening || undefined,
        lastScreeningDate: form.lastScreeningDate || undefined,
        notes: form.medicalNotes || undefined,
      },
      availability: {
        isAvailable: form.isAvailable,
        availableDays: parseList(form.availableDays),
        preferredTimeWindow: form.preferredTimeWindow || undefined,
        travelRadiusKm: form.travelRadiusKm ? Number(form.travelRadiusKm) : undefined,
      },
      preference: {
        organDonationOptIn: form.organDonationOptIn,
        bloodDonationOptIn: form.bloodDonationOptIn,
        maxRequestsPerMonth: Number(form.maxRequestsPerMonth || 2),
        supportedDonationTypes: parseDonationTypes(form.supportedDonationTypes),
        preferredHospitals: parseList(form.preferredHospitals),
      },
    }),
    [form],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.hospitalId) {
      setSubmitError('Please select a hospital before saving the donor.');
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
          <CardTitle>Core Donor Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="donorCode">Donor Code</Label>
            <Input
              id="donorCode"
              value={form.donorCode}
              onChange={(e) => setForm({ ...form, donorCode: e.target.value })}
              required
            />
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
              onChange={(value) => setForm({ ...form, gender: value as Donor['gender'] })}
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
            <Label>Status</Label>
            <Select
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value as Donor['status'] })}
              options={donorStatusOptions}
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
            <Input
              id="state"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
            />
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
          <div className="space-y-2">
            <Label htmlFor="lastDonationDate">Last Donation Date</Label>
            <Input
              id="lastDonationDate"
              type="date"
              value={form.lastDonationDate}
              onChange={(e) => setForm({ ...form, lastDonationDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableFrom">Available From</Label>
            <Input
              id="availableFrom"
              type="date"
              value={form.availableFrom}
              onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medical and Availability Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bmi">BMI</Label>
            <Input id="bmi" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastScreeningDate">Last Screening Date</Label>
            <Input
              id="lastScreeningDate"
              type="date"
              value={form.lastScreeningDate}
              onChange={(e) => setForm({ ...form, lastScreeningDate: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicalConditions">Medical Conditions</Label>
            <Textarea
              id="medicalConditions"
              value={form.medicalConditions}
              onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="infectiousScreening">Infectious Disease Screening</Label>
            <Textarea
              id="infectiousScreening"
              value={form.infectiousScreening}
              onChange={(e) => setForm({ ...form, infectiousScreening: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicalNotes">Notes</Label>
            <Textarea
              id="medicalNotes"
              value={form.medicalNotes}
              onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availableDays">Available Days (comma-separated)</Label>
            <Input
              id="availableDays"
              value={form.availableDays}
              onChange={(e) => setForm({ ...form, availableDays: e.target.value })}
              placeholder="MONDAY, THURSDAY"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredTimeWindow">Preferred Time Window</Label>
            <Input
              id="preferredTimeWindow"
              value={form.preferredTimeWindow}
              onChange={(e) => setForm({ ...form, preferredTimeWindow: e.target.value })}
              placeholder="Morning"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="travelRadiusKm">Travel Radius (km)</Label>
            <Input
              id="travelRadiusKm"
              type="number"
              value={form.travelRadiusKm}
              onChange={(e) => setForm({ ...form, travelRadiusKm: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredHospitals">Preferred Hospitals (comma-separated)</Label>
            <Input
              id="preferredHospitals"
              value={form.preferredHospitals}
              onChange={(e) => setForm({ ...form, preferredHospitals: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportedDonationTypes">Supported Donation Types</Label>
            <Input
              id="supportedDonationTypes"
              value={form.supportedDonationTypes}
              onChange={(e) => setForm({ ...form, supportedDonationTypes: e.target.value })}
              placeholder="ORGAN, BLOOD, PLASMA"
            />
            <p className="text-xs text-muted-foreground">Accepted values: ORGAN, BLOOD, PLASMA.</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3 md:col-span-2">
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                />
                Available for requests
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.organDonationOptIn}
                  onChange={(e) => setForm({ ...form, organDonationOptIn: e.target.checked })}
                />
                Organ donation opt-in
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.bloodDonationOptIn}
                  onChange={(e) => setForm({ ...form, bloodDonationOptIn: e.target.checked })}
                />
                Blood donation opt-in
              </label>
            </div>
            <div className="mt-3 max-w-xs space-y-2">
              <Label htmlFor="maxRequestsPerMonth">Max Requests Per Month</Label>
              <Input
                id="maxRequestsPerMonth"
                type="number"
                value={form.maxRequestsPerMonth}
                onChange={(e) => setForm({ ...form, maxRequestsPerMonth: e.target.value })}
              />
            </div>
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
          {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Donor' : 'Update Donor'}
        </Button>
      </div>
    </form>
  );
}

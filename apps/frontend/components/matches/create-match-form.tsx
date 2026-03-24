'use client';

import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { matchesApi } from '@/lib/api/endpoints';
import { Donor, MatchStatus, Patient } from '@/lib/types/api';
import { matchStatusOptions } from '@/lib/types/options';

type Props = {
  patients: Patient[];
  donors: Donor[];
  onCreated: () => void;
};

export function CreateMatchForm({ patients, donors, onCreated }: Props) {
  const [form, setForm] = useState({
    patientId: patients[0]?.id ?? '',
    donorId: donors[0]?.id ?? '',
    status: 'PENDING' as MatchStatus,
    compatibilityScore: '70',
    matchReason: 'Initial compatibility placeholder entry.',
  });

  const createMutation = useMutation({
    mutationFn: () =>
      matchesApi.create({
        patientId: form.patientId,
        donorId: form.donorId,
        status: form.status,
        compatibilityScore: Number(form.compatibilityScore || 0),
        matchReason: form.matchReason,
      }),
    onSuccess: () => {
      onCreated();
      setForm((prev) => ({ ...prev, compatibilityScore: '70', matchReason: 'Initial compatibility placeholder entry.' }));
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  return (
    <form className="grid gap-3 md:grid-cols-5" onSubmit={onSubmit}>
      <div className="space-y-1 md:col-span-2">
        <Label>Patient</Label>
        <Select
          value={form.patientId}
          onChange={(value) => setForm({ ...form, patientId: value })}
          options={patients.map((patient) => ({ label: `${patient.fullName} (${patient.uhid})`, value: patient.id }))}
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>Donor</Label>
        <Select
          value={form.donorId}
          onChange={(value) => setForm({ ...form, donorId: value })}
          options={donors.map((donor) => ({ label: `${donor.fullName} (${donor.donorCode})`, value: donor.id }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <Select
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value as MatchStatus })}
          options={matchStatusOptions}
        />
      </div>
      <div className="space-y-1">
        <Label>Compatibility %</Label>
        <Input
          type="number"
          min={0}
          max={100}
          value={form.compatibilityScore}
          onChange={(event) => setForm({ ...form, compatibilityScore: event.target.value })}
        />
      </div>
      <div className="space-y-1 md:col-span-3">
        <Label>Match Reason</Label>
        <Input
          value={form.matchReason}
          onChange={(event) => setForm({ ...form, matchReason: event.target.value })}
        />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending ? 'Creating...' : 'Create Match'}
        </Button>
      </div>
    </form>
  );
}

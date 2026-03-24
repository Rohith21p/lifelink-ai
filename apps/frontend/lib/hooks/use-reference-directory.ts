import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { donorsApi, patientsApi } from '@/lib/api/endpoints';
import { Coordinator, Donor, Hospital, Patient } from '@/lib/types/api';

type Option = {
  label: string;
  value: string;
};

type CoordinatorOption = Option & {
  hospitalId?: string;
};

function upsertHospitalOption(map: Map<string, Option>, hospitalId: string, hospital?: Hospital) {
  if (map.has(hospitalId)) {
    return;
  }

  const label = hospital
    ? `${hospital.name} (${hospital.city}, ${hospital.state})`
    : `Hospital ${hospitalId.slice(0, 8)}`;

  map.set(hospitalId, { label, value: hospitalId });
}

function upsertCoordinatorOption(
  map: Map<string, CoordinatorOption>,
  coordinatorId: string,
  coordinator?: Coordinator | null,
  hospitalId?: string,
) {
  if (map.has(coordinatorId)) {
    return;
  }

  const label = coordinator
    ? `${coordinator.fullName} (${coordinator.email})`
    : `Coordinator ${coordinatorId.slice(0, 8)}`;

  map.set(coordinatorId, {
    label,
    value: coordinatorId,
    hospitalId,
  });
}

function collectPatientReferences(
  patient: Patient,
  hospitals: Map<string, Option>,
  coordinators: Map<string, CoordinatorOption>,
) {
  upsertHospitalOption(hospitals, patient.hospitalId, patient.hospital);

  if (patient.coordinatorId) {
    upsertCoordinatorOption(
      coordinators,
      patient.coordinatorId,
      patient.coordinator ?? null,
      patient.hospitalId,
    );
  }
}

function collectDonorReferences(
  donor: Donor,
  hospitals: Map<string, Option>,
  coordinators: Map<string, CoordinatorOption>,
) {
  upsertHospitalOption(hospitals, donor.hospitalId, donor.hospital);

  if (donor.coordinatorId) {
    upsertCoordinatorOption(
      coordinators,
      donor.coordinatorId,
      donor.coordinator ?? null,
      donor.hospitalId,
    );
  }
}

export function useReferenceDirectory() {
  const query = useQuery({
    queryKey: ['reference-directory'],
    queryFn: async () => {
      const [patientsResult, donorsResult] = await Promise.allSettled([
        patientsApi.getAll(),
        donorsApi.getAll(),
      ]);

      const patients = patientsResult.status === 'fulfilled' ? patientsResult.value : [];
      const donors = donorsResult.status === 'fulfilled' ? donorsResult.value : [];

      const hospitals = new Map<string, Option>();
      const coordinators = new Map<string, CoordinatorOption>();

      for (const patient of patients) {
        collectPatientReferences(patient, hospitals, coordinators);
      }

      for (const donor of donors) {
        collectDonorReferences(donor, hospitals, coordinators);
      }

      return {
        hospitals: Array.from(hospitals.values()).sort((a, b) => a.label.localeCompare(b.label)),
        coordinators: Array.from(coordinators.values()).sort((a, b) => a.label.localeCompare(b.label)),
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const hospitalOptions = useMemo(() => query.data?.hospitals ?? [], [query.data]);
  const coordinatorOptions = useMemo(() => query.data?.coordinators ?? [], [query.data]);

  return {
    ...query,
    hospitalOptions,
    coordinatorOptions,
  };
}

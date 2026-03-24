import {
  BloodRequestStatus,
  CaseStatus,
  CoordinatorRole,
  DonationType,
  DonorStatus,
  ExtractionStatus,
  Gender,
  MatchReviewAction,
  MatchStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEventType,
  NotificationType,
  OrganType,
  PrismaClient,
  ReportFileType,
  UrgencyLevel,
} from '@prisma/client';

const prisma = new PrismaClient();

type HospitalSeed = {
  code: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contactNumber: string;
};

const hospitals: HospitalSeed[] = [
  {
    code: 'HSP-MUM-001',
    name: 'Apollo Hospitals Navi Mumbai',
    address: 'Plot 13, Parsik Hill Road, CBD Belapur',
    city: 'Mumbai',
    state: 'Maharashtra',
    contactNumber: '+91-22-6280-0000',
  },
  {
    code: 'HSP-DEL-001',
    name: 'AIIMS New Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar',
    city: 'New Delhi',
    state: 'Delhi',
    contactNumber: '+91-11-2658-8500',
  },
  {
    code: 'HSP-BLR-001',
    name: 'Narayana Health City',
    address: '258/A, Bommasandra Industrial Area, Hosur Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    contactNumber: '+91-80-7122-2222',
  },
];

function mustGet(map: Map<string, string>, key: string) {
  const value = map.get(key);
  if (!value) {
    throw new Error(`Seed dependency missing for key ${key}`);
  }
  return value;
}

async function seedHospitals() {
  const hospitalMap = new Map<string, string>();

  for (const hospital of hospitals) {
    const record = await prisma.hospital.upsert({
      where: { code: hospital.code },
      create: hospital,
      update: hospital,
    });

    hospitalMap.set(hospital.code, record.id);
  }

  return hospitalMap;
}

async function seedCoordinators(hospitalMap: Map<string, string>) {
  const coordinatorSeeds = [
    {
      fullName: 'Priya Nair',
      phone: '+91-9892001122',
      email: 'priya.nair@lifelink-demo.in',
      role: CoordinatorRole.ADMIN,
      hospitalCode: 'HSP-MUM-001',
    },
    {
      fullName: 'Arvind Menon',
      phone: '+91-9820045566',
      email: 'arvind.menon@lifelink-demo.in',
      role: CoordinatorRole.COORDINATOR,
      hospitalCode: 'HSP-MUM-001',
    },
    {
      fullName: 'Dr. Kavita Singh',
      phone: '+91-9810004455',
      email: 'kavita.singh@lifelink-demo.in',
      role: CoordinatorRole.EXECUTIVE,
      hospitalCode: 'HSP-DEL-001',
    },
    {
      fullName: 'Sandeep Rao',
      phone: '+91-9986407788',
      email: 'sandeep.rao@lifelink-demo.in',
      role: CoordinatorRole.COORDINATOR,
      hospitalCode: 'HSP-BLR-001',
    },
    {
      fullName: 'Mehul Shah',
      phone: '+91-9820023445',
      email: 'mehul.shah@lifelink-demo.in',
      role: CoordinatorRole.COORDINATOR,
      hospitalCode: 'HSP-MUM-001',
    },
  ];

  const coordinatorMap = new Map<string, string>();

  for (const coordinator of coordinatorSeeds) {
    const record = await prisma.coordinator.upsert({
      where: { email: coordinator.email },
      create: {
        hospitalId: mustGet(hospitalMap, coordinator.hospitalCode),
        fullName: coordinator.fullName,
        phone: coordinator.phone,
        email: coordinator.email,
        role: coordinator.role,
      },
      update: {
        hospitalId: mustGet(hospitalMap, coordinator.hospitalCode),
        fullName: coordinator.fullName,
        phone: coordinator.phone,
        role: coordinator.role,
      },
    });

    coordinatorMap.set(coordinator.email, record.id);
  }

  return coordinatorMap;
}

async function seedPatients(
  hospitalMap: Map<string, string>,
  coordinatorMap: Map<string, string>,
) {
  const patientSeeds = [
    {
      uhid: 'UHID-MUM-1001',
      fullName: 'Rahul Sharma',
      age: 42,
      gender: Gender.MALE,
      bloodGroup: 'B+',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      organNeeded: OrganType.KIDNEY,
      urgencyLevel: UrgencyLevel.CRITICAL,
      caseStatus: CaseStatus.MATCHING,
      requestActive: true,
      hospitalCode: 'HSP-MUM-001',
      coordinatorEmail: 'priya.nair@lifelink-demo.in',
      medicalProfile: {
        primaryDiagnosis: 'End-stage renal disease',
        comorbidities: 'Type 2 diabetes, hypertension',
        heightCm: 173,
        weightKg: 78,
        allergies: 'None known',
        currentMedication: 'Insulin, Amlodipine',
        lastAssessmentDate: new Date('2026-03-20T09:30:00.000Z'),
      },
      request: {
        organType: OrganType.KIDNEY,
        requestedOn: new Date('2026-03-15T10:00:00.000Z'),
        requiredBy: new Date('2026-04-10T00:00:00.000Z'),
        hospitalPriority: 1,
        notes: 'Compatible living donor preferred. Crossmatch urgent.',
      },
      guardian: {
        fullName: 'Asha Sharma',
        relation: 'Spouse',
        phone: '+91-9876543210',
        email: 'asha.sharma@demo.in',
      },
      timeline: [
        {
          eventType: 'CASE_CREATED',
          description: 'Patient added to transplant coordination system.',
          eventAt: new Date('2026-03-15T10:05:00.000Z'),
          createdBy: 'Priya Nair',
        },
        {
          eventType: 'MATCHING_STARTED',
          description: 'Coordinator moved case to active donor matching.',
          eventAt: new Date('2026-03-18T12:10:00.000Z'),
          createdBy: 'Arvind Menon',
        },
      ],
    },
    {
      uhid: 'UHID-BLR-1014',
      fullName: 'Meena Iyer',
      age: 36,
      gender: Gender.FEMALE,
      bloodGroup: 'O+',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      organNeeded: OrganType.LIVER,
      urgencyLevel: UrgencyLevel.HIGH,
      caseStatus: CaseStatus.UNDER_REVIEW,
      requestActive: true,
      hospitalCode: 'HSP-BLR-001',
      coordinatorEmail: 'sandeep.rao@lifelink-demo.in',
      medicalProfile: {
        primaryDiagnosis: 'Acute liver failure',
        comorbidities: 'Autoimmune hepatitis',
        heightCm: 160,
        weightKg: 62,
        allergies: 'Sulfa drugs',
        currentMedication: 'Steroids',
        lastAssessmentDate: new Date('2026-03-21T07:45:00.000Z'),
      },
      request: {
        organType: OrganType.LIVER,
        requestedOn: new Date('2026-03-19T10:00:00.000Z'),
        requiredBy: new Date('2026-04-15T00:00:00.000Z'),
        hospitalPriority: 2,
        notes: 'ABO-compatible donor, urgent counseling underway.',
      },
      guardian: {
        fullName: 'Srinivas Iyer',
        relation: 'Father',
        phone: '+91-9986112233',
        email: 's.iyer@demo.in',
      },
      timeline: [
        {
          eventType: 'CASE_CREATED',
          description: 'Liver transplant request initiated by hepatology team.',
          eventAt: new Date('2026-03-19T10:12:00.000Z'),
          createdBy: 'Sandeep Rao',
        },
      ],
    },
    {
      uhid: 'UHID-DEL-1108',
      fullName: 'Aftab Khan',
      age: 51,
      gender: Gender.MALE,
      bloodGroup: 'A+',
      city: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      organNeeded: OrganType.HEART,
      urgencyLevel: UrgencyLevel.HIGH,
      caseStatus: CaseStatus.MATCHING,
      requestActive: true,
      hospitalCode: 'HSP-DEL-001',
      coordinatorEmail: 'kavita.singh@lifelink-demo.in',
      medicalProfile: {
        primaryDiagnosis: 'Dilated cardiomyopathy',
        comorbidities: 'Chronic heart failure',
        heightCm: 175,
        weightKg: 84,
        allergies: 'None known',
        currentMedication: 'Beta blockers, diuretics',
        lastAssessmentDate: new Date('2026-03-18T06:15:00.000Z'),
      },
      request: {
        organType: OrganType.HEART,
        requestedOn: new Date('2026-03-16T10:00:00.000Z'),
        requiredBy: new Date('2026-04-01T00:00:00.000Z'),
        hospitalPriority: 1,
        notes: 'Waiting list escalated. ICU monitoring active.',
      },
      guardian: {
        fullName: 'Shabnam Khan',
        relation: 'Spouse',
        phone: '+91-9711223344',
        email: 'shabnam.khan@demo.in',
      },
      timeline: [
        {
          eventType: 'ICU_ESCALATION',
          description: 'Patient moved to advanced cardiac ICU care.',
          eventAt: new Date('2026-03-20T03:00:00.000Z'),
          createdBy: 'Dr. Kavita Singh',
        },
      ],
    },
    {
      uhid: 'UHID-MUM-1018',
      fullName: 'Pooja Patel',
      age: 28,
      gender: Gender.FEMALE,
      bloodGroup: 'AB+',
      city: 'Mumbai',
      district: 'Mumbai City',
      state: 'Maharashtra',
      organNeeded: OrganType.BLOOD,
      urgencyLevel: UrgencyLevel.MEDIUM,
      caseStatus: CaseStatus.NEW,
      requestActive: true,
      hospitalCode: 'HSP-MUM-001',
      coordinatorEmail: 'arvind.menon@lifelink-demo.in',
      medicalProfile: {
        primaryDiagnosis: 'Postpartum hemorrhage recovery support',
        comorbidities: 'Iron deficiency anemia',
        heightCm: 158,
        weightKg: 56,
        allergies: 'None known',
        currentMedication: 'Iron supplements',
        lastAssessmentDate: new Date('2026-03-23T08:00:00.000Z'),
      },
      request: {
        organType: OrganType.BLOOD,
        requestedOn: new Date('2026-03-23T09:00:00.000Z'),
        requiredBy: new Date('2026-03-30T00:00:00.000Z'),
        hospitalPriority: 3,
        notes: 'Regular blood support planned over next week.',
      },
      guardian: {
        fullName: 'Karan Patel',
        relation: 'Brother',
        phone: '+91-9820445566',
        email: 'karan.patel@demo.in',
      },
      timeline: [
        {
          eventType: 'CASE_CREATED',
          description: 'Supportive blood requirement opened by clinician.',
          eventAt: new Date('2026-03-23T09:05:00.000Z'),
          createdBy: 'Arvind Menon',
        },
      ],
    },
  ];

  const patientMap = new Map<string, string>();

  for (const patientSeed of patientSeeds) {
    const patient = await prisma.patient.upsert({
      where: { uhid: patientSeed.uhid },
      create: {
        hospitalId: mustGet(hospitalMap, patientSeed.hospitalCode),
        coordinatorId: mustGet(coordinatorMap, patientSeed.coordinatorEmail),
        uhid: patientSeed.uhid,
        fullName: patientSeed.fullName,
        age: patientSeed.age,
        gender: patientSeed.gender,
        bloodGroup: patientSeed.bloodGroup,
        city: patientSeed.city,
        district: patientSeed.district,
        state: patientSeed.state,
        organNeeded: patientSeed.organNeeded,
        urgencyLevel: patientSeed.urgencyLevel,
        caseStatus: patientSeed.caseStatus,
        requestActive: patientSeed.requestActive,
      },
      update: {
        hospitalId: mustGet(hospitalMap, patientSeed.hospitalCode),
        coordinatorId: mustGet(coordinatorMap, patientSeed.coordinatorEmail),
        fullName: patientSeed.fullName,
        age: patientSeed.age,
        gender: patientSeed.gender,
        bloodGroup: patientSeed.bloodGroup,
        city: patientSeed.city,
        district: patientSeed.district,
        state: patientSeed.state,
        organNeeded: patientSeed.organNeeded,
        urgencyLevel: patientSeed.urgencyLevel,
        caseStatus: patientSeed.caseStatus,
        requestActive: patientSeed.requestActive,
      },
    });

    await prisma.patientMedicalProfile.upsert({
      where: { patientId: patient.id },
      create: {
        patientId: patient.id,
        ...patientSeed.medicalProfile,
      },
      update: patientSeed.medicalProfile,
    });

    await prisma.patientRequest.upsert({
      where: { patientId: patient.id },
      create: {
        patientId: patient.id,
        ...patientSeed.request,
      },
      update: patientSeed.request,
    });

    await prisma.patientGuardian.deleteMany({ where: { patientId: patient.id } });
    await prisma.patientGuardian.create({
      data: {
        patientId: patient.id,
        fullName: patientSeed.guardian.fullName,
        relation: patientSeed.guardian.relation,
        phone: patientSeed.guardian.phone,
        email: patientSeed.guardian.email,
        isPrimary: true,
      },
    });

    await prisma.caseTimeline.deleteMany({ where: { patientId: patient.id } });
    await prisma.caseTimeline.createMany({
      data: patientSeed.timeline.map((entry) => ({
        patientId: patient.id,
        eventType: entry.eventType,
        description: entry.description,
        eventAt: entry.eventAt,
        createdBy: entry.createdBy,
      })),
    });

    patientMap.set(patientSeed.uhid, patient.id);
  }

  return patientMap;
}

async function seedDonors(
  hospitalMap: Map<string, string>,
  coordinatorMap: Map<string, string>,
) {
  const donorSeeds = [
    {
      donorCode: 'DON-MUM-2001',
      fullName: 'Sneha Kulkarni',
      age: 31,
      gender: Gender.FEMALE,
      bloodGroup: 'B+',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      status: DonorStatus.AVAILABLE,
      hospitalCode: 'HSP-MUM-001',
      coordinatorEmail: 'arvind.menon@lifelink-demo.in',
      lastDonationDate: new Date('2025-11-15T09:30:00.000Z'),
      availableFrom: new Date('2026-03-25T00:00:00.000Z'),
      medicalProfile: {
        bmi: 22.4,
        medicalConditions: 'No chronic conditions',
        infectiousDiseaseScreening: 'Negative',
        lastScreeningDate: new Date('2026-03-05T06:30:00.000Z'),
        notes: 'High reliability donor.',
      },
      availability: {
        isAvailable: true,
        availableDays: ['MONDAY', 'WEDNESDAY', 'SATURDAY'],
        preferredTimeWindow: 'Morning',
        travelRadiusKm: 25,
      },
      preference: {
        organDonationOptIn: true,
        bloodDonationOptIn: true,
        maxRequestsPerMonth: 2,
        supportedDonationTypes: [DonationType.ORGAN, DonationType.BLOOD],
        preferredHospitals: ['Apollo Hospitals Navi Mumbai'],
      },
    },
    {
      donorCode: 'DON-DEL-2010',
      fullName: 'Imran Sheikh',
      age: 38,
      gender: Gender.MALE,
      bloodGroup: 'A+',
      city: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      status: DonorStatus.AVAILABLE,
      hospitalCode: 'HSP-DEL-001',
      coordinatorEmail: 'kavita.singh@lifelink-demo.in',
      lastDonationDate: new Date('2025-10-10T08:00:00.000Z'),
      availableFrom: new Date('2026-03-26T00:00:00.000Z'),
      medicalProfile: {
        bmi: 24.8,
        medicalConditions: 'Mild seasonal allergy',
        infectiousDiseaseScreening: 'Negative',
        lastScreeningDate: new Date('2026-02-28T08:00:00.000Z'),
        notes: 'Eligible for blood and partial liver donation assessment.',
      },
      availability: {
        isAvailable: true,
        availableDays: ['TUESDAY', 'THURSDAY'],
        preferredTimeWindow: 'Evening',
        travelRadiusKm: 20,
      },
      preference: {
        organDonationOptIn: true,
        bloodDonationOptIn: true,
        maxRequestsPerMonth: 1,
        supportedDonationTypes: [DonationType.ORGAN, DonationType.BLOOD, DonationType.PLASMA],
        preferredHospitals: ['AIIMS New Delhi'],
      },
    },
    {
      donorCode: 'DON-BLR-2022',
      fullName: 'Vijay Reddy',
      age: 34,
      gender: Gender.MALE,
      bloodGroup: 'O+',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      status: DonorStatus.AVAILABLE,
      hospitalCode: 'HSP-BLR-001',
      coordinatorEmail: 'sandeep.rao@lifelink-demo.in',
      lastDonationDate: new Date('2025-12-21T07:15:00.000Z'),
      availableFrom: new Date('2026-03-24T00:00:00.000Z'),
      medicalProfile: {
        bmi: 23.1,
        medicalConditions: 'Fit',
        infectiousDiseaseScreening: 'Negative',
        lastScreeningDate: new Date('2026-03-10T07:00:00.000Z'),
        notes: 'Strong match candidate for liver donation screening.',
      },
      availability: {
        isAvailable: true,
        availableDays: ['MONDAY', 'FRIDAY'],
        preferredTimeWindow: 'Afternoon',
        travelRadiusKm: 40,
      },
      preference: {
        organDonationOptIn: true,
        bloodDonationOptIn: true,
        maxRequestsPerMonth: 2,
        supportedDonationTypes: [DonationType.ORGAN, DonationType.BLOOD],
        preferredHospitals: ['Narayana Health City'],
      },
    },
    {
      donorCode: 'DON-MUM-2033',
      fullName: 'Priyanka Joshi',
      age: 29,
      gender: Gender.FEMALE,
      bloodGroup: 'AB+',
      city: 'Thane',
      district: 'Thane',
      state: 'Maharashtra',
      status: DonorStatus.TEMP_UNAVAILABLE,
      hospitalCode: 'HSP-MUM-001',
      coordinatorEmail: 'priya.nair@lifelink-demo.in',
      lastDonationDate: new Date('2025-09-14T09:00:00.000Z'),
      availableFrom: new Date('2026-04-02T00:00:00.000Z'),
      medicalProfile: {
        bmi: 21.9,
        medicalConditions: 'Recovering from flu',
        infectiousDiseaseScreening: 'Pending repeat test',
        lastScreeningDate: new Date('2026-03-22T11:30:00.000Z'),
        notes: 'Temporarily unavailable due to mild illness.',
      },
      availability: {
        isAvailable: false,
        availableDays: ['SUNDAY'],
        preferredTimeWindow: 'Morning',
        travelRadiusKm: 15,
      },
      preference: {
        organDonationOptIn: true,
        bloodDonationOptIn: false,
        maxRequestsPerMonth: 1,
        supportedDonationTypes: [DonationType.ORGAN],
        preferredHospitals: ['Apollo Hospitals Navi Mumbai'],
      },
    },
  ];

  const donorMap = new Map<string, string>();

  for (const donorSeed of donorSeeds) {
    const donor = await prisma.donor.upsert({
      where: { donorCode: donorSeed.donorCode },
      create: {
        hospitalId: mustGet(hospitalMap, donorSeed.hospitalCode),
        coordinatorId: mustGet(coordinatorMap, donorSeed.coordinatorEmail),
        donorCode: donorSeed.donorCode,
        fullName: donorSeed.fullName,
        age: donorSeed.age,
        gender: donorSeed.gender,
        bloodGroup: donorSeed.bloodGroup,
        city: donorSeed.city,
        district: donorSeed.district,
        state: donorSeed.state,
        status: donorSeed.status,
        lastDonationDate: donorSeed.lastDonationDate,
        availableFrom: donorSeed.availableFrom,
      },
      update: {
        hospitalId: mustGet(hospitalMap, donorSeed.hospitalCode),
        coordinatorId: mustGet(coordinatorMap, donorSeed.coordinatorEmail),
        fullName: donorSeed.fullName,
        age: donorSeed.age,
        gender: donorSeed.gender,
        bloodGroup: donorSeed.bloodGroup,
        city: donorSeed.city,
        district: donorSeed.district,
        state: donorSeed.state,
        status: donorSeed.status,
        lastDonationDate: donorSeed.lastDonationDate,
        availableFrom: donorSeed.availableFrom,
      },
    });

    await prisma.donorMedicalProfile.upsert({
      where: { donorId: donor.id },
      create: {
        donorId: donor.id,
        ...donorSeed.medicalProfile,
      },
      update: donorSeed.medicalProfile,
    });

    await prisma.donorAvailability.upsert({
      where: { donorId: donor.id },
      create: {
        donorId: donor.id,
        ...donorSeed.availability,
      },
      update: donorSeed.availability,
    });

    await prisma.donorPreference.upsert({
      where: { donorId: donor.id },
      create: {
        donorId: donor.id,
        ...donorSeed.preference,
      },
      update: donorSeed.preference,
    });

    donorMap.set(donorSeed.donorCode, donor.id);
  }

  return donorMap;
}

async function seedMatches(
  patientMap: Map<string, string>,
  donorMap: Map<string, string>,
  coordinatorMap: Map<string, string>,
) {
  const matchSeeds = [
    {
      key: 'M1',
      patientUhid: 'UHID-MUM-1001',
      donorCode: 'DON-MUM-2001',
      status: MatchStatus.SHORTLISTED,
      compatibilityScore: 88,
      bloodCompatibilityScore: 95,
      locationScore: 92,
      availabilityScore: 88,
      overallScore: 88,
      urgencyLevel: UrgencyLevel.CRITICAL,
      matchReason: 'ABO compatible with high location and readiness score.',
      reviewNotes: 'Shortlisted for final panel review.',
      reviewedBy: 'arvind.menon@lifelink-demo.in',
    },
    {
      key: 'M2',
      patientUhid: 'UHID-BLR-1014',
      donorCode: 'DON-BLR-2022',
      status: MatchStatus.CONTACTED,
      compatibilityScore: 81,
      bloodCompatibilityScore: 90,
      locationScore: 95,
      availabilityScore: 84,
      overallScore: 81,
      urgencyLevel: UrgencyLevel.HIGH,
      matchReason: 'Strong district match and donor availability in next 48 hours.',
      reviewNotes: 'Family counseling in progress.',
      reviewedBy: 'sandeep.rao@lifelink-demo.in',
    },
    {
      key: 'M3',
      patientUhid: 'UHID-DEL-1108',
      donorCode: 'DON-DEL-2010',
      status: MatchStatus.APPROVED,
      compatibilityScore: 76,
      bloodCompatibilityScore: 85,
      locationScore: 80,
      availabilityScore: 72,
      overallScore: 76,
      urgencyLevel: UrgencyLevel.HIGH,
      matchReason: 'Heart case approved after multidisciplinary review.',
      reviewNotes: 'Approved for pre-op evaluation.',
      reviewedBy: 'kavita.singh@lifelink-demo.in',
    },
    {
      key: 'M4',
      patientUhid: 'UHID-MUM-1018',
      donorCode: 'DON-MUM-2033',
      status: MatchStatus.PENDING,
      compatibilityScore: 58,
      bloodCompatibilityScore: 70,
      locationScore: 78,
      availabilityScore: 25,
      overallScore: 58,
      urgencyLevel: UrgencyLevel.MEDIUM,
      matchReason: 'Blood compatibility exists; donor currently temporary unavailable.',
      reviewNotes: 'Reassess after donor availability update.',
      reviewedBy: 'priya.nair@lifelink-demo.in',
    },
  ];

  const matchMap = new Map<string, string>();

  for (const matchSeed of matchSeeds) {
    const record = await prisma.donorPatientMatch.upsert({
      where: {
        patientId_donorId: {
          patientId: mustGet(patientMap, matchSeed.patientUhid),
          donorId: mustGet(donorMap, matchSeed.donorCode),
        },
      },
      create: {
        patientId: mustGet(patientMap, matchSeed.patientUhid),
        donorId: mustGet(donorMap, matchSeed.donorCode),
        status: matchSeed.status,
        compatibilityScore: matchSeed.compatibilityScore,
        bloodCompatibilityScore: matchSeed.bloodCompatibilityScore,
        locationScore: matchSeed.locationScore,
        availabilityScore: matchSeed.availabilityScore,
        overallScore: matchSeed.overallScore,
        urgencyLevel: matchSeed.urgencyLevel,
        matchReason: matchSeed.matchReason,
        reviewNotes: matchSeed.reviewNotes,
        reviewedByCoordinatorId: mustGet(coordinatorMap, matchSeed.reviewedBy),
        reviewedAt: new Date('2026-03-24T10:00:00.000Z'),
      },
      update: {
        status: matchSeed.status,
        compatibilityScore: matchSeed.compatibilityScore,
        bloodCompatibilityScore: matchSeed.bloodCompatibilityScore,
        locationScore: matchSeed.locationScore,
        availabilityScore: matchSeed.availabilityScore,
        overallScore: matchSeed.overallScore,
        urgencyLevel: matchSeed.urgencyLevel,
        matchReason: matchSeed.matchReason,
        reviewNotes: matchSeed.reviewNotes,
        reviewedByCoordinatorId: mustGet(coordinatorMap, matchSeed.reviewedBy),
        reviewedAt: new Date('2026-03-24T10:00:00.000Z'),
      },
    });

    matchMap.set(matchSeed.key, record.id);
  }

  return matchMap;
}

async function seedMatchReviews(matchMap: Map<string, string>, coordinatorMap: Map<string, string>) {
  await prisma.matchReview.deleteMany();

  await prisma.matchReview.createMany({
    data: [
      {
        matchId: mustGet(matchMap, 'M1'),
        reviewerCoordinatorId: mustGet(coordinatorMap, 'arvind.menon@lifelink-demo.in'),
        action: MatchReviewAction.REVIEW,
        note: 'Initial review completed with favorable blood score.',
      },
      {
        matchId: mustGet(matchMap, 'M1'),
        reviewerCoordinatorId: mustGet(coordinatorMap, 'arvind.menon@lifelink-demo.in'),
        action: MatchReviewAction.SHORTLIST,
        note: 'Shortlisted for transplant board.',
      },
      {
        matchId: mustGet(matchMap, 'M3'),
        reviewerCoordinatorId: mustGet(coordinatorMap, 'kavita.singh@lifelink-demo.in'),
        action: MatchReviewAction.APPROVE,
        note: 'Approved after medical board sign-off.',
      },
      {
        matchId: mustGet(matchMap, 'M4'),
        reviewerCoordinatorId: mustGet(coordinatorMap, 'priya.nair@lifelink-demo.in'),
        action: MatchReviewAction.REVIEW,
        note: 'Kept pending due to temporary donor unavailability.',
      },
    ],
  });
}

async function seedBloodBanks(hospitalMap: Map<string, string>) {
  const bloodBanks = [
    {
      code: 'BB-MUM-001',
      name: 'Apollo Regional Blood Center',
      address: 'CBD Belapur, Navi Mumbai',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      contactNumber: '+91-22-6100-2200',
      hospitalCode: 'HSP-MUM-001',
    },
    {
      code: 'BB-DEL-001',
      name: 'AIIMS Central Blood Bank',
      address: 'Ansari Nagar, New Delhi',
      city: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi',
      contactNumber: '+91-11-2659-0001',
      hospitalCode: 'HSP-DEL-001',
    },
    {
      code: 'BB-BLR-001',
      name: 'Narayana Blood Services',
      address: 'Bommasandra Industrial Area',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      contactNumber: '+91-80-7122-1000',
      hospitalCode: 'HSP-BLR-001',
    },
  ];

  const bloodBankMap = new Map<string, string>();

  for (const bloodBank of bloodBanks) {
    const record = await prisma.bloodBank.upsert({
      where: { code: bloodBank.code },
      create: {
        hospitalId: mustGet(hospitalMap, bloodBank.hospitalCode),
        code: bloodBank.code,
        name: bloodBank.name,
        address: bloodBank.address,
        city: bloodBank.city,
        district: bloodBank.district,
        state: bloodBank.state,
        contactNumber: bloodBank.contactNumber,
      },
      update: {
        hospitalId: mustGet(hospitalMap, bloodBank.hospitalCode),
        name: bloodBank.name,
        address: bloodBank.address,
        city: bloodBank.city,
        district: bloodBank.district,
        state: bloodBank.state,
        contactNumber: bloodBank.contactNumber,
      },
    });

    bloodBankMap.set(bloodBank.code, record.id);
  }

  return bloodBankMap;
}

async function seedBloodInventory(bloodBankMap: Map<string, string>) {
  const inventorySeeds = [
    { bloodBankCode: 'BB-MUM-001', bloodGroup: 'A+', unitsAvailable: 18, lowStockThreshold: 10 },
    { bloodBankCode: 'BB-MUM-001', bloodGroup: 'O+', unitsAvailable: 7, lowStockThreshold: 10 },
    { bloodBankCode: 'BB-DEL-001', bloodGroup: 'B+', unitsAvailable: 14, lowStockThreshold: 8 },
    { bloodBankCode: 'BB-DEL-001', bloodGroup: 'AB-', unitsAvailable: 4, lowStockThreshold: 6 },
    { bloodBankCode: 'BB-BLR-001', bloodGroup: 'O-', unitsAvailable: 5, lowStockThreshold: 7 },
    { bloodBankCode: 'BB-BLR-001', bloodGroup: 'AB+', unitsAvailable: 12, lowStockThreshold: 6 },
  ];

  for (const seed of inventorySeeds) {
    await prisma.bloodInventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId: mustGet(bloodBankMap, seed.bloodBankCode),
          bloodGroup: seed.bloodGroup,
        },
      },
      create: {
        bloodBankId: mustGet(bloodBankMap, seed.bloodBankCode),
        bloodGroup: seed.bloodGroup,
        unitsAvailable: seed.unitsAvailable,
        lowStockThreshold: seed.lowStockThreshold,
        lastUpdatedBy: 'Seed Script',
        lastUpdatedAt: new Date('2026-03-24T09:30:00.000Z'),
      },
      update: {
        unitsAvailable: seed.unitsAvailable,
        lowStockThreshold: seed.lowStockThreshold,
        lastUpdatedBy: 'Seed Script',
        lastUpdatedAt: new Date('2026-03-24T09:30:00.000Z'),
      },
    });
  }
}

async function seedBloodRequests(
  bloodBankMap: Map<string, string>,
  patientMap: Map<string, string>,
  coordinatorMap: Map<string, string>,
) {
  await prisma.bloodRequest.deleteMany();

  await prisma.bloodRequest.createMany({
    data: [
      {
        bloodBankId: mustGet(bloodBankMap, 'BB-MUM-001'),
        patientId: mustGet(patientMap, 'UHID-MUM-1018'),
        requestedByCoordinatorId: mustGet(coordinatorMap, 'arvind.menon@lifelink-demo.in'),
        bloodGroup: 'AB+',
        unitsRequested: 3,
        status: BloodRequestStatus.IN_PROGRESS,
        priority: UrgencyLevel.HIGH,
        requiredBy: new Date('2026-03-27T12:00:00.000Z'),
        notes: 'Immediate post-op support request.',
      },
      {
        bloodBankId: mustGet(bloodBankMap, 'BB-BLR-001'),
        patientId: mustGet(patientMap, 'UHID-BLR-1014'),
        requestedByCoordinatorId: mustGet(coordinatorMap, 'sandeep.rao@lifelink-demo.in'),
        bloodGroup: 'O+',
        unitsRequested: 2,
        status: BloodRequestStatus.OPEN,
        priority: UrgencyLevel.MEDIUM,
        requiredBy: new Date('2026-03-28T09:00:00.000Z'),
        notes: 'Reserve for procedure support.',
      },
      {
        bloodBankId: mustGet(bloodBankMap, 'BB-DEL-001'),
        patientId: mustGet(patientMap, 'UHID-DEL-1108'),
        requestedByCoordinatorId: mustGet(coordinatorMap, 'kavita.singh@lifelink-demo.in'),
        bloodGroup: 'A+',
        unitsRequested: 2,
        status: BloodRequestStatus.FULFILLED,
        priority: UrgencyLevel.HIGH,
        fulfilledAt: new Date('2026-03-23T10:30:00.000Z'),
        notes: 'Fulfilled from emergency reserve.',
      },
    ],
  });
}

async function seedReports(
  patientMap: Map<string, string>,
  coordinatorMap: Map<string, string>,
) {
  await prisma.reportExtraction.deleteMany();
  await prisma.reportFile.deleteMany();

  const reports = [
    {
      key: 'R1',
      patientUhid: 'UHID-MUM-1001',
      coordinatorEmail: 'arvind.menon@lifelink-demo.in',
      fileName: 'rahul-sharma-nephrology-evaluation.pdf',
      fileType: ReportFileType.PDF,
      fileUrl: '/demo/reports/rahul-sharma-nephrology-evaluation.pdf',
      fileSizeKb: 980,
      extractionStatus: ExtractionStatus.COMPLETED,
      extractedSummary:
        'Blood Group: B+\\nDiagnosis: End-stage renal disease\\nUrgency Hint: Critical case. Prioritize immediate panel review.',
    },
    {
      key: 'R2',
      patientUhid: 'UHID-BLR-1014',
      coordinatorEmail: 'sandeep.rao@lifelink-demo.in',
      fileName: 'meena-iyer-liver-panel.png',
      fileType: ReportFileType.IMAGE,
      fileUrl: '/demo/reports/meena-iyer-liver-panel.png',
      fileSizeKb: 620,
      extractionStatus: ExtractionStatus.PENDING,
      extractedSummary: null,
    },
    {
      key: 'R3',
      patientUhid: 'UHID-DEL-1108',
      coordinatorEmail: 'kavita.singh@lifelink-demo.in',
      fileName: 'aftab-khan-cardiology-summary.pdf',
      fileType: ReportFileType.PDF,
      fileUrl: '/demo/reports/aftab-khan-cardiology-summary.pdf',
      fileSizeKb: 1120,
      extractionStatus: ExtractionStatus.COMPLETED,
      extractedSummary:
        'Blood Group: A+\\nDiagnosis: Dilated cardiomyopathy\\nUrgency Hint: High urgency. Schedule review in the next cycle.',
    },
  ];

  const reportMap = new Map<string, string>();

  for (const report of reports) {
    const record = await prisma.reportFile.create({
      data: {
        patientId: mustGet(patientMap, report.patientUhid),
        uploadedByCoordinatorId: mustGet(coordinatorMap, report.coordinatorEmail),
        fileName: report.fileName,
        fileType: report.fileType,
        fileUrl: report.fileUrl,
        fileSizeKb: report.fileSizeKb,
        extractionStatus: report.extractionStatus,
        extractedSummary: report.extractedSummary,
        metadata: {
          source: 'seed',
          mimeType: report.fileType === ReportFileType.PDF ? 'application/pdf' : 'image/png',
        },
      },
    });

    reportMap.set(report.key, record.id);
  }

  await prisma.reportExtraction.createMany({
    data: [
      {
        reportFileId: mustGet(reportMap, 'R1'),
        status: ExtractionStatus.COMPLETED,
        bloodGroup: 'B+',
        diagnosis: 'End-stage renal disease',
        keyNotes: 'Crossmatch and immunology panel recommended.',
        urgencyHint: 'Critical case. Prioritize immediate panel review.',
        flaggedConditions: ['Type 2 diabetes', 'hypertension'],
        rawPayload: { engine: 'mock-report-parser-v1', confidence: 0.83 },
      },
      {
        reportFileId: mustGet(reportMap, 'R3'),
        status: ExtractionStatus.COMPLETED,
        bloodGroup: 'A+',
        diagnosis: 'Dilated cardiomyopathy',
        keyNotes: 'ICU monitoring required before transplant slot.',
        urgencyHint: 'High urgency. Schedule review in the next cycle.',
        flaggedConditions: ['Chronic heart failure'],
        rawPayload: { engine: 'mock-report-parser-v1', confidence: 0.79 },
      },
    ],
  });

  return reportMap;
}

async function seedNotificationTemplates() {
  const templates = [
    {
      name: 'new_match_found_inapp',
      eventType: NotificationEventType.NEW_MATCH_FOUND,
      channel: NotificationChannel.IN_APP,
      subject: 'New match found',
      bodyTemplate: 'New match identified for {{patientName}} with donor {{donorName}} (score {{score}}%).',
    },
    {
      name: 'urgent_case_created_inapp',
      eventType: NotificationEventType.URGENT_CASE_CREATED,
      channel: NotificationChannel.IN_APP,
      subject: 'Urgent case created',
      bodyTemplate: 'Urgent case created for {{patientName}}. Please initiate immediate review.',
    },
    {
      name: 'donor_shortlisted_inapp',
      eventType: NotificationEventType.DONOR_SHORTLISTED,
      channel: NotificationChannel.IN_APP,
      subject: 'Donor shortlisted',
      bodyTemplate: 'Donor {{donorName}} shortlisted for patient {{patientName}}.',
    },
    {
      name: 'patient_status_updated_sms',
      eventType: NotificationEventType.PATIENT_STATUS_UPDATED,
      channel: NotificationChannel.SMS,
      subject: 'Patient status update',
      bodyTemplate: 'Status update for {{patientName}}: {{status}}.',
    },
    {
      name: 'appointment_reminder_email',
      eventType: NotificationEventType.APPOINTMENT_REMINDER,
      channel: NotificationChannel.EMAIL,
      subject: 'Appointment reminder',
      bodyTemplate: 'Reminder: {{patientName}} appointment scheduled for {{appointmentTime}}.',
    },
    {
      name: 'low_stock_alert_whatsapp',
      eventType: NotificationEventType.LOW_BLOOD_STOCK_ALERT,
      channel: NotificationChannel.WHATSAPP,
      subject: 'Low blood stock alert',
      bodyTemplate: 'Low stock alert: {{bloodGroup}} at {{bloodBankName}} has only {{unitsAvailable}} units.',
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { name: template.name },
      create: template,
      update: template,
    });
  }
}

async function seedNotificationsAndLogs(
  hospitalMap: Map<string, string>,
  patientMap: Map<string, string>,
  donorMap: Map<string, string>,
  matchMap: Map<string, string>,
  reportMap: Map<string, string>,
  bloodBankMap: Map<string, string>,
) {
  await prisma.notificationLog.deleteMany();
  await prisma.notification.deleteMany();

  const templateMap = new Map<string, string>();
  const templates = await prisma.notificationTemplate.findMany();
  templates.forEach((template) => templateMap.set(template.name, template.id));

  const notifications = [
    {
      hospitalCode: 'HSP-MUM-001',
      type: NotificationType.ALERT,
      channel: NotificationChannel.IN_APP,
      eventType: NotificationEventType.URGENT_CASE_CREATED,
      title: 'Urgent Kidney Case Escalated',
      message: 'Rahul Sharma case moved to critical priority and needs immediate match review.',
      metadata: { patientName: 'Rahul Sharma', urgency: 'CRITICAL' },
      templateName: 'urgent_case_created_inapp',
      patientUhid: 'UHID-MUM-1001',
      donorCode: 'DON-MUM-2001',
      matchKey: 'M1',
    },
    {
      hospitalCode: 'HSP-BLR-001',
      type: NotificationType.WARNING,
      channel: NotificationChannel.IN_APP,
      eventType: NotificationEventType.DONOR_SHORTLISTED,
      title: 'Donor Shortlisted for Liver Case',
      message: 'DON-BLR-2022 shortlisted for Meena Iyer. Awaiting final counselor confirmation.',
      metadata: { patientName: 'Meena Iyer', donorName: 'Vijay Reddy' },
      templateName: 'donor_shortlisted_inapp',
      patientUhid: 'UHID-BLR-1014',
      donorCode: 'DON-BLR-2022',
      matchKey: 'M2',
    },
    {
      hospitalCode: 'HSP-DEL-001',
      type: NotificationType.INFO,
      channel: NotificationChannel.SMS,
      eventType: NotificationEventType.PATIENT_STATUS_UPDATED,
      title: 'Patient Status Updated',
      message: 'Aftab Khan status updated to APPROVED.',
      metadata: { patientName: 'Aftab Khan', status: 'APPROVED' },
      templateName: 'patient_status_updated_sms',
      patientUhid: 'UHID-DEL-1108',
      donorCode: 'DON-DEL-2010',
      matchKey: 'M3',
    },
    {
      hospitalCode: 'HSP-BLR-001',
      type: NotificationType.ALERT,
      channel: NotificationChannel.WHATSAPP,
      eventType: NotificationEventType.LOW_BLOOD_STOCK_ALERT,
      title: 'Low Blood Stock Alert',
      message: 'O- stock is below threshold at Narayana Blood Services.',
      metadata: { bloodGroup: 'O-', unitsAvailable: 5, bloodBankName: 'Narayana Blood Services' },
      templateName: 'low_stock_alert_whatsapp',
      bloodBankCode: 'BB-BLR-001',
    },
    {
      hospitalCode: 'HSP-MUM-001',
      type: NotificationType.INFO,
      channel: NotificationChannel.EMAIL,
      eventType: NotificationEventType.APPOINTMENT_REMINDER,
      title: 'Appointment Reminder',
      message: 'Reminder sent for Rahul Sharma donor panel appointment.',
      metadata: { patientName: 'Rahul Sharma', appointmentTime: '2026-03-26 10:30 IST' },
      templateName: 'appointment_reminder_email',
      patientUhid: 'UHID-MUM-1001',
      reportKey: 'R1',
    },
    {
      hospitalCode: 'HSP-MUM-001',
      type: NotificationType.INFO,
      channel: NotificationChannel.IN_APP,
      eventType: NotificationEventType.NEW_MATCH_FOUND,
      title: 'New Match Found',
      message: 'A new compatibility match has been generated for Rahul Sharma.',
      metadata: { patientName: 'Rahul Sharma', donorName: 'Sneha Kulkarni', score: 88 },
      templateName: 'new_match_found_inapp',
      patientUhid: 'UHID-MUM-1001',
      donorCode: 'DON-MUM-2001',
      matchKey: 'M1',
    },
  ];

  for (const item of notifications) {
    const notification = await prisma.notification.create({
      data: {
        hospitalId: mustGet(hospitalMap, item.hospitalCode),
        type: item.type,
        channel: item.channel,
        eventType: item.eventType,
        targetRole: 'COORDINATOR',
        title: item.title,
        message: item.message,
        metadata: item.metadata,
      },
    });

    await prisma.notificationLog.create({
      data: {
        notificationId: notification.id,
        templateId: item.templateName ? templateMap.get(item.templateName) : undefined,
        channel: item.channel,
        eventType: item.eventType,
        status: NotificationDeliveryStatus.SENT,
        recipient:
          item.channel === NotificationChannel.SMS
            ? '+91-9892001122'
            : item.channel === NotificationChannel.EMAIL
              ? 'coordinator@lifelink-demo.in'
              : item.channel === NotificationChannel.WHATSAPP
                ? '+91-9986407788'
                : 'IN_APP',
        message: item.message,
        metadata: item.metadata,
        patientId: item.patientUhid ? mustGet(patientMap, item.patientUhid) : undefined,
        donorId: item.donorCode ? mustGet(donorMap, item.donorCode) : undefined,
        matchId: item.matchKey ? mustGet(matchMap, item.matchKey) : undefined,
        reportFileId: item.reportKey ? mustGet(reportMap, item.reportKey) : undefined,
        bloodBankId: item.bloodBankCode ? mustGet(bloodBankMap, item.bloodBankCode) : undefined,
        sentAt: new Date('2026-03-24T10:30:00.000Z'),
      },
    });
  }
}

async function seedSettings(hospitalMap: Map<string, string>) {
  const settings = [
    {
      hospitalCode: 'HSP-MUM-001',
      key: 'demo_mode',
      value: { enabled: true, roleOptions: ['EXECUTIVE', 'COORDINATOR', 'ADMIN'] },
    },
    {
      hospitalCode: 'HSP-DEL-001',
      key: 'notification_rules',
      value: { urgentThresholdHours: 24, alertOnCritical: true },
    },
    {
      hospitalCode: 'HSP-BLR-001',
      key: 'matching_preferences',
      value: { minCompatibilityScore: 65, allowManualOverride: true },
    },
    {
      hospitalCode: 'HSP-BLR-001',
      key: 'blood_bank_thresholds',
      value: { defaultLowStockThreshold: 8, autoAlertChannels: ['IN_APP', 'WHATSAPP'] },
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: {
        hospitalId_key: {
          hospitalId: mustGet(hospitalMap, setting.hospitalCode),
          key: setting.key,
        },
      },
      create: {
        hospitalId: mustGet(hospitalMap, setting.hospitalCode),
        key: setting.key,
        value: setting.value,
      },
      update: {
        value: setting.value,
      },
    });
  }
}

async function main() {
  const hospitalMap = await seedHospitals();
  const coordinatorMap = await seedCoordinators(hospitalMap);
  const patientMap = await seedPatients(hospitalMap, coordinatorMap);
  const donorMap = await seedDonors(hospitalMap, coordinatorMap);

  const matchMap = await seedMatches(patientMap, donorMap, coordinatorMap);
  await seedMatchReviews(matchMap, coordinatorMap);

  const bloodBankMap = await seedBloodBanks(hospitalMap);
  await seedBloodInventory(bloodBankMap);
  await seedBloodRequests(bloodBankMap, patientMap, coordinatorMap);

  const reportMap = await seedReports(patientMap, coordinatorMap);

  await seedNotificationTemplates();
  await seedNotificationsAndLogs(
    hospitalMap,
    patientMap,
    donorMap,
    matchMap,
    reportMap,
    bloodBankMap,
  );
  await seedSettings(hospitalMap);

  // eslint-disable-next-line no-console
  console.log('LifeLink AI Step 2 demo data seeded successfully.');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

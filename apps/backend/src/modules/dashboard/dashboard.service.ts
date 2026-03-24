import { Injectable } from '@nestjs/common';
import { CaseStatus, MatchStatus, UrgencyLevel } from '../../common/enums';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      totalPatients,
      totalDonors,
      activeRequests,
      urgentCases,
      patientStatusBreakdown,
      donorStatusBreakdown,
      totalMatches,
      pendingReviews,
      approvedMatches,
      uploadedReportsCount,
      unreadNotifications,
      inventory,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.donor.count(),
      this.prisma.patient.count({
        where: {
          requestActive: true,
          caseStatus: {
            not: CaseStatus.CLOSED,
          },
        },
      }),
      this.prisma.patient.count({
        where: {
          urgencyLevel: {
            in: [UrgencyLevel.HIGH, UrgencyLevel.CRITICAL],
          },
          caseStatus: {
            not: CaseStatus.CLOSED,
          },
        },
      }),
      this.prisma.patient.groupBy({
        by: ['caseStatus'],
        _count: { caseStatus: true },
      }),
      this.prisma.donor.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.donorPatientMatch.count(),
      this.prisma.donorPatientMatch.count({
        where: {
          status: {
            in: [MatchStatus.PENDING, MatchStatus.SHORTLISTED, MatchStatus.CONTACTED],
          },
        },
      }),
      this.prisma.donorPatientMatch.count({
        where: {
          status: MatchStatus.APPROVED,
        },
      }),
      this.prisma.reportFile.count(),
      this.prisma.notification.count({
        where: {
          isRead: false,
        },
      }),
      this.prisma.bloodInventory.findMany(),
    ]);

    const lowStockAlerts = inventory.filter(
      (item) => item.unitsAvailable <= item.lowStockThreshold,
    );

    return {
      totalPatients,
      totalDonors,
      activeRequests,
      urgentCases,
      totalMatches,
      pendingReviews,
      approvedMatches,
      uploadedReportsCount,
      lowBloodStockAlerts: lowStockAlerts.length,
      unreadNotifications,
      patientStatusBreakdown: patientStatusBreakdown.map((item) => ({
        status: item.caseStatus,
        count: item._count.caseStatus,
      })),
      donorStatusBreakdown: donorStatusBreakdown.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      monthlyTrend: [
        { month: 'Nov', requests: 8, donations: 5 },
        { month: 'Dec', requests: 9, donations: 6 },
        { month: 'Jan', requests: 11, donations: 7 },
        { month: 'Feb', requests: 12, donations: 8 },
        { month: 'Mar', requests: 14, donations: 9 },
      ],
    };
  }

  async getRecentActivities() {
    const [notifications, caseEvents, matchReviews] = await Promise.all([
      this.prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      this.prisma.caseTimeline.findMany({
        orderBy: { eventAt: 'desc' },
        take: 8,
        include: {
          patient: {
            select: {
              id: true,
              fullName: true,
              uhid: true,
            },
          },
        },
      }),
      this.prisma.matchReview.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          match: {
            include: {
              patient: {
                select: {
                  id: true,
                  fullName: true,
                  uhid: true,
                },
              },
              donor: {
                select: {
                  id: true,
                  fullName: true,
                  donorCode: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return [...notifications, ...caseEvents, ...matchReviews]
      .map((item) => {
        if ('type' in item) {
          return {
            id: item.id,
            category: 'NOTIFICATION',
            title: item.title,
            description: item.message,
            timestamp: item.createdAt,
          };
        }

        if ('eventType' in item) {
          return {
            id: item.id,
            category: item.eventType,
            title: `${item.patient.fullName} (${item.patient.uhid})`,
            description: item.description,
            timestamp: item.eventAt,
          };
        }

        return {
          id: item.id,
          category: `MATCH_${item.action}`,
          title: `${item.match.patient.fullName} ↔ ${item.match.donor.fullName}`,
          description: item.note ?? 'Match review activity updated.',
          timestamp: item.createdAt,
        };
      })
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
      .slice(0, 10);
  }

  async getRecentMatchActivity() {
    return this.prisma.donorPatientMatch.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 12,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            uhid: true,
            urgencyLevel: true,
          },
        },
        donor: {
          select: {
            id: true,
            fullName: true,
            donorCode: true,
          },
        },
      },
    });
  }

  async getLowStockAlerts() {
    const inventory = await this.prisma.bloodInventory.findMany({
      include: {
        bloodBank: {
          select: {
            id: true,
            name: true,
            code: true,
            city: true,
            district: true,
            state: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return inventory.filter((item) => item.unitsAvailable <= item.lowStockThreshold);
  }

  async getRecentNotifications() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
  }
}

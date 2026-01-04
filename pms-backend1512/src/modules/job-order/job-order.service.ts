import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../shared/util/prisma.service";
import { CreateJobOrderDto } from "./dto/create-job-order.dto";
import { UpdateJobOrderDto } from "./dto/update-job-order.dto";

@Injectable()
export class JobOrderService {
  constructor(private prisma: PrismaService) {}

  async generateNextJobId(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `MPS-J-${currentYear}-`;

    // Find all job orders for the current year
    const jobOrders = await this.prisma.jobOrder.findMany({
      where: {
        jobId: {
          startsWith: yearPrefix,
        },
      },
      select: {
        jobId: true,
      },
    });

    let maxSequence = 0;

    // Extract sequence numbers and find the maximum
    jobOrders.forEach((order) => {
      const sequencePart = order.jobId.replace(yearPrefix, '');
      const sequence = parseInt(sequencePart, 10);
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    });

    // Next sequence is max + 1, or 1 if no job orders exist
    const nextSequence = maxSequence + 1;

    // Format: MPS-J-2025-32250
    return `${yearPrefix}${nextSequence}`;
  }

  async create(createJobOrderDto: CreateJobOrderDto, attachmentPath?: string) {
    // Generate sequential Job ID
    const jobId = await this.generateNextJobId();

    const data: any = {
      jobId: jobId,
      clientName: createJobOrderDto.clientName,
      clientType: createJobOrderDto.clientType,
      jobTitle: createJobOrderDto.jobTitle,
      jobDescriptionSummary: createJobOrderDto.jobDescriptionSummary,
      workLocationCountry: createJobOrderDto.workLocationCountry,
      remoteHybridOnsite: createJobOrderDto.remoteHybridOnsite,
      jobStartDate: new Date(createJobOrderDto.jobStartDate),
      jobEndDate: new Date(createJobOrderDto.jobEndDate),
      contractType: createJobOrderDto.contractType,
      numberOfPositions: createJobOrderDto.numberOfPositions,
      requiredSkills: createJobOrderDto.requiredSkills,
      yearsOfExperience: createJobOrderDto.yearsOfExperience,
      minEducationalQualification: createJobOrderDto.minEducationalQualification,
      salaryCtcRange: createJobOrderDto.salaryCtcRange,
      shift: createJobOrderDto.shift,
      shiftTiming: createJobOrderDto.shiftTiming,
      languageRequirement: createJobOrderDto.languageRequirement,
      languageProficiencyLevel: createJobOrderDto.languageProficiencyLevel,
      nationalityPreference: createJobOrderDto.nationalityPreference,
      visaWorkPermitProvided: createJobOrderDto.visaWorkPermitProvided,
      clientSpocName: createJobOrderDto.clientSpocName,
      internalRecruiterAssigned: createJobOrderDto.internalRecruiterAssigned,
      remarksNotes: createJobOrderDto.remarksNotes,
      detailedJdAttachment: attachmentPath || createJobOrderDto.detailedJdAttachment,
      jobOwner: createJobOrderDto.jobOwner,
      deliveryLead: createJobOrderDto.deliveryLead,
      status: createJobOrderDto.status || "Open",
      createdBy: { connect: { id: createJobOrderDto.createdBy } },
    };

    return this.prisma.jobOrder.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.jobOrder.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const jobOrder = await this.prisma.jobOrder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!jobOrder) {
      throw new NotFoundException(`Job order with ID ${id} not found`);
    }

    return jobOrder;
  }

  async update(id: string, updateJobOrderDto: UpdateJobOrderDto, attachmentPath?: string) {
    const existingJobOrder = await this.prisma.jobOrder.findUnique({
      where: { id },
    });

    if (!existingJobOrder) {
      throw new NotFoundException(`Job order with ID ${id} not found`);
    }

    const data: any = {};

    if (updateJobOrderDto.jobId) data.jobId = updateJobOrderDto.jobId;
    if (updateJobOrderDto.clientName) data.clientName = updateJobOrderDto.clientName;
    if (updateJobOrderDto.clientType) data.clientType = updateJobOrderDto.clientType;
    if (updateJobOrderDto.jobTitle) data.jobTitle = updateJobOrderDto.jobTitle;
    if (updateJobOrderDto.jobDescriptionSummary) data.jobDescriptionSummary = updateJobOrderDto.jobDescriptionSummary;
    if (updateJobOrderDto.workLocationCountry) data.workLocationCountry = updateJobOrderDto.workLocationCountry;
    if (updateJobOrderDto.remoteHybridOnsite) data.remoteHybridOnsite = updateJobOrderDto.remoteHybridOnsite;
    if (updateJobOrderDto.jobStartDate) data.jobStartDate = new Date(updateJobOrderDto.jobStartDate);
    if (updateJobOrderDto.jobEndDate) data.jobEndDate = new Date(updateJobOrderDto.jobEndDate);
    if (updateJobOrderDto.contractType) data.contractType = updateJobOrderDto.contractType;
    if (updateJobOrderDto.numberOfPositions !== undefined) data.numberOfPositions = updateJobOrderDto.numberOfPositions;
    if (updateJobOrderDto.requiredSkills !== undefined) data.requiredSkills = updateJobOrderDto.requiredSkills;
    if (updateJobOrderDto.yearsOfExperience !== undefined) data.yearsOfExperience = updateJobOrderDto.yearsOfExperience;
    if (updateJobOrderDto.minEducationalQualification !== undefined) data.minEducationalQualification = updateJobOrderDto.minEducationalQualification;
    if (updateJobOrderDto.salaryCtcRange) data.salaryCtcRange = updateJobOrderDto.salaryCtcRange;
    if (updateJobOrderDto.shift !== undefined) data.shift = updateJobOrderDto.shift;
    if (updateJobOrderDto.shiftTiming !== undefined) data.shiftTiming = updateJobOrderDto.shiftTiming;
    if (updateJobOrderDto.languageRequirement !== undefined) data.languageRequirement = updateJobOrderDto.languageRequirement;
    if (updateJobOrderDto.languageProficiencyLevel !== undefined) data.languageProficiencyLevel = updateJobOrderDto.languageProficiencyLevel;
    if (updateJobOrderDto.nationalityPreference !== undefined) data.nationalityPreference = updateJobOrderDto.nationalityPreference;
    if (updateJobOrderDto.visaWorkPermitProvided !== undefined) data.visaWorkPermitProvided = updateJobOrderDto.visaWorkPermitProvided;
    if (updateJobOrderDto.clientSpocName) data.clientSpocName = updateJobOrderDto.clientSpocName;
    if (updateJobOrderDto.internalRecruiterAssigned !== undefined) data.internalRecruiterAssigned = updateJobOrderDto.internalRecruiterAssigned;
    if (updateJobOrderDto.remarksNotes !== undefined) data.remarksNotes = updateJobOrderDto.remarksNotes;
    if (attachmentPath) data.detailedJdAttachment = attachmentPath;
    else if (updateJobOrderDto.detailedJdAttachment !== undefined) data.detailedJdAttachment = updateJobOrderDto.detailedJdAttachment;
    if (updateJobOrderDto.jobOwner) data.jobOwner = updateJobOrderDto.jobOwner;
    if (updateJobOrderDto.deliveryLead) data.deliveryLead = updateJobOrderDto.deliveryLead;
    if (updateJobOrderDto.status) data.status = updateJobOrderDto.status;
    if (updateJobOrderDto.updatedBy) data.updatedById = updateJobOrderDto.updatedBy;

    return this.prisma.jobOrder.update({
      where: { id },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const jobOrder = await this.prisma.jobOrder.findUnique({
      where: { id },
    });

    if (!jobOrder) {
      throw new NotFoundException(`Job order with ID ${id} not found`);
    }

    return this.prisma.jobOrder.delete({
      where: { id },
    });
  }

  async getCandidateStatistics(jobOrderId: string) {
    // Verify job order exists
    const jobOrder = await this.prisma.jobOrder.findUnique({
      where: { id: jobOrderId },
    });

    if (!jobOrder) {
      throw new NotFoundException(`Job order with ID ${jobOrderId} not found`);
    }

    // Count proposals by status for this job order
    const [submitted, proposed, selected, joined, rejected] = await Promise.all([
      // SUBMITTED
      this.prisma.proposal.count({
        where: {
          jobOrderId: jobOrderId,
          submittedStatus: 'SUBMITTED',
        },
      }),
      // PROPOSED
      this.prisma.proposal.count({
        where: {
          jobOrderId: jobOrderId,
          submittedStatus: 'PROPOSED',
        },
      }),
      // SELECTED
      this.prisma.proposal.count({
        where: {
          jobOrderId: jobOrderId,
          submittedStatus: 'SELECTED',
        },
      }),
      // JOINED
      this.prisma.proposal.count({
        where: {
          jobOrderId: jobOrderId,
          submittedStatus: 'JOINED',
        },
      }),
      // REJECTED (both REJECTED_CLIENT and REJECTED_INTERNAL)
      this.prisma.proposal.count({
        where: {
          jobOrderId: jobOrderId,
          submittedStatus: {
            in: ['REJECTED_CLIENT', 'REJECTED_INTERNAL'],
          },
        },
      }),
    ]);

    return {
      submitted,
      proposed,
      selected,
      joined,
      rejected,
    };
  }
}


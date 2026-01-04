import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/util/prisma.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { SearchRecordsDto } from "./dto/search-record.dto";
import * as moment from "moment";
import { format, startOfWeek, endOfWeek } from "date-fns";

@Injectable()
export class ProposalService {
  constructor(private prisma: PrismaService) {}

  async create(createProposalDto: CreateProposalDto) {
    const {
      profileId,
      clientName,
      location,
      remarks,
      candidateName,
      roleApplied,
      nationality,
      email,
      contact,
      noticePeriod,
      passportValidity,
      currentSalary,
      primarySkills,
      createdBy, // User ID
      attachment,
      proposedTo,
      submittedStatus,
      currentLocation,
      university,
      educationLevel,
      visaType,
      interviewAvailable,
      totalYearsExperience,
      relevantYearsExperience,
      reasonForJobChange,
      passport,
      currentJobDetails,
      jobLanguage,
      proficiency,
      proficiencyEnglish,
      billingCurrency,
      billingNo,
      selectionDate,
      joiningDate,
      salaryCurrency,
      invoiceDate,
      invoiceNo,
      nativeLanguage,
      jobOrderId,
    } = createProposalDto;

    try {
      // Use Prisma to create the proposal with the related user (createdById)
      const createData: any = {
        profileId,
        clientName,
        location,
        remarks,
        candidateName,
        roleApplied,
        nationality,
        email,
        contact,
        noticePeriod,
        passportValidity,
        currentSalary,
        primarySkills,
        attachment,
        createdBy: { connect: { id: createdBy } },
        proposedTo,
        submittedStatus,
        currentLocation,
        university,
        educationLevel,
        visaType,
        interviewAvailable,
        totalYearsExperience,
        relevantYearsExperience,
        reasonForJobChange,
        passport,
        currentJobDetails,
        jobLanguage,
        proficiency,
        proficiencyEnglish,
        billingCurrency,
        billingNo,
        selectionDate,
        joiningDate,
        salaryCurrency,
        invoiceDate,
        invoiceNo,
        nativeLanguage,
      };

      // Add jobOrder relation only if jobOrderId is provided
      if (jobOrderId) {
        createData.jobOrder = { connect: { id: jobOrderId } };
      }

      const proposal = await this.prisma.proposal.create({
        data: createData,
      });

      return proposal;
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw new Error("Failed to create proposal");
    }
  }

  async findAll() {
    return this.prisma.proposal.findMany();
  }

  async findAllByWeek(dateFrom: any, dateTo: any, isDashboard?) {
    // Set Monday as the start of the week
    const monday = moment().startOf("isoWeek").toDate();
    const sunday = moment().endOf("isoWeek").toDate();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (isDashboard) {
      const total = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      });

      const totalProposed = await this.prisma.proposal.count({
        where: {
          proposalDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "PROPOSED",
        },
      });

      const totalJoined = await this.prisma.proposal.count({
        where: {
          joiningDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "JOINED",
        },
      });

      const totalSelection = await this.prisma.proposal.count({
        where: {
          selectionDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SELECTED",
        },
      });

      const totalSubmission = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SUBMITTED",
        },
      });
      const totalDroppedClient = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "DROPPED_CLIENT"
        },
      });

      const totalDroppedInternal = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus:"DROPPED_INTERNAL"
        },
      });

      const totalRejectedClient = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_CLIENT",
        },
      });
      const totalRejectedInternal = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_INTERNAL",
        },
      });
      return [
        {
          total: total,
          totalSubmission: totalSubmission,
          totalJoined: totalJoined,
          totalProposed: totalProposed,
          totalSelection: totalSelection,
          totalDroppedClient: totalDroppedClient,
          totalDroppedInternal: totalDroppedInternal,
          totalRejectedClient:totalRejectedClient,
          totalRejectedInternal:totalRejectedInternal
        },
      ];
    } else {
      return this.prisma.proposal.findMany({
        where: {
          createdAt: {
            gte: dateFrom ? dateFrom : monday,
            lte: dateTo ? dateTo : sunday,
          },
        },
      });
    }
  }

  async findOne(id: string) {
    return this.prisma.proposal.findUnique({ where: { id } });
  }

  async update(id: string, updateProposalDto: UpdateProposalDto) {
    const {
      clientName,
      location,
      remarks,
      candidateName,
      roleApplied,
      nationality,
      email,
      contact,
      noticePeriod,
      passportValidity,
      currentSalary,
      primarySkills,
      proposedTo,
      submittedStatus,
      attachment,
      updatedBy,
      createdBy,
      jobOrderId,
      ...otherFields // Handle additional fields dynamically
    } = updateProposalDto;

    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
        updatedBy: { connect: { id: updatedBy } },
        clientName,
        location,
        remarks,
        candidateName,
        roleApplied,
        nationality,
        email,
        contact,
        noticePeriod,
        passportValidity,
        currentSalary,
        primarySkills,
        proposedTo,
        submittedStatus,
        attachment,
        ...otherFields,
      };

      // Handle jobOrderId relation
      if (jobOrderId !== undefined) {
        if (jobOrderId) {
          updateData.jobOrder = { connect: { id: jobOrderId } };
        } else {
          updateData.jobOrder = { disconnect: true };
        }
      }

      // Reset dates if submittedStatus is updated to "Submitted"
      if (updateData.previousStatus !== "SUBMITTED" && updateData.submittedStatus === "SUBMITTED") {
        updateData.joiningDate = null;
        updateData.selectionDate = null;
        updateData.proposalDate = null;
        updateData.rejection_dropped_Date = null;
        updateData.createdAt = new Date().toISOString(); // Set createdAt to the current date
      }

      const proposal = await this.prisma.proposal.update({
        where: { id },
        data: updateData,
      });

      return proposal;
    } catch (error) {
      console.error("Error updating proposal:", error);
      throw new BadRequestException("Failed to update proposal");
    }
  }

  async remove(id: string) {
    return this.prisma.proposal.delete({ where: { id } });
  }

  async findByCreatedBy(createdById: string, username: string, roleName, dateFrom, dateTo, isDashboard?) {
    const monday = moment().startOf("isoWeek").toDate();
    const sunday = moment().endOf("isoWeek").toDate();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // Get the list of all userIds (flattened to a single array)
    const allIds = await this.findReportToList(username);

    if (isDashboard) {
      const total = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      });

      const totalSubmission = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SUBMITTED",
        },
      });

      const totalDropped = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: {
            in: ["DROPPED_CLIENT", "DROPPED_INTERNAL"], // Enum values as strings
          },
        },
      });

      const totalProposed = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          proposalDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "PROPOSED",
        },
      });

      const totalJoined = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          joiningDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "JOINED",
        },
      });

      const totalSelection = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Proper spread operator usage
          },
          selectionDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SELECTED",
        },
      });

      const totalDroppedClient = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "DROPPED_CLIENT"
        },
      });

      const totalDroppedInternal = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus:"DROPPED_INTERNAL"
        },
      });
      
      const totalRejectedClient = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_CLIENT",
        },
      });
      const totalRejectedInternal = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_INTERNAL",
        },
      });

      return [
        {
          total: total,
          totalSubmission: totalSubmission,
          totalJoined: totalJoined,
          totalProposed: totalProposed,
          totalSelection: totalSelection,
          totalDroppedClient: totalDroppedClient,
          totalDroppedInternal: totalDroppedInternal,
          totalRejectedClient:totalRejectedClient,
          totalRejectedInternal:totalRejectedInternal

        },
      ];
    } else {
      return this.prisma.proposal.findMany({
        where: {
          createdById: {
            in: [createdById, ...allIds], // Spread the userIds here
          },
          createdAt: {
            gte: dateFrom ? dateFrom : monday,
            lte: dateTo ? dateTo : sunday,
          },
        },
      });
    }
  }

  async findReportToList(username: any) {
    const userIDsUsername = [];

    // Check if username is an array
    const userDetails = Array.isArray(username)
      ? await this.prisma.employee.findMany({
          where: { username: { in: username } },
        })
      : await this.prisma.employee.findUnique({
          where: { username: username },
        });

    if (!userDetails) {
      console.log("User not found");
      return [];
    }

    // If userDetails is an array (in case of multiple usernames), iterate through each user
    const userIds = Array.isArray(userDetails) ? userDetails.map((user) => user.id) : [userDetails.id]; // If it's a single user, wrap the id in an array

    // Fetch all user roles that report to the users
    const allRCDetails = await this.prisma.userRole.findMany({
      where: { reportsTo: { in: userIds } },
      include: {
        users: true,
      },
    });

    // Flatten all user IDs from the roles
    allRCDetails.forEach((roleDetail) => {
      const userIdsInRole = roleDetail.users.map((user) => user.id); // Extract user ids
      userIDsUsername.push(...userIdsInRole); // Flatten and push the user IDs into the main array
    });

    return userIDsUsername; // Return the array of all user IDs
  }

  // Method to get users who report to a manager/TL/admin
  async findUsersReportingTo(reportsTo: string) {
    return this.prisma.userRole.findMany({
      where: { reportsTo: reportsTo },
    });
  }

  // Method to get proposals by list of 'createdBy' names for manager/TL/admin role
  async findByCreatedByList(recruiterNames: string[]) {
    return this.prisma.proposal.findMany({
      where: {
        createdById: {
          in: recruiterNames,
        },
      },
    });
  }

  async findUserDetailsFromId(id: string) {
    const userDetails = await this.prisma.user.findUnique({
      where: { id: id },
    });
    return await this.prisma.userRole.findUnique({
      where: { id: userDetails["userRoleId"] },
      include: {
        role: true,
        managerDetails: true,
      },
    });
  }

  async findByClientId(id: string, startDay: string, endDay: string, isDashboard?) {
    const monday = moment().startOf("isoWeek").toDate();
    const sunday = moment().endOf("isoWeek").toDate();
    let data = {};
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const userDetails = await this.prisma.user.findUnique({
      where: { id: id },
    });
    const userClientDetails = await this.prisma.userClient.findMany({
      where: {
        userId: id, // Query based on userId
      },
      include: {
        client: true, // Include the client details if needed
      },
    });

    // If no user-client details found, throw an error
    if (!userClientDetails || userClientDetails.length === 0) {
      throw new Error("No details found for the given userId");
    }

    // Extract all client names from the userClientDetails array
    const clientNames = userClientDetails.map((userClient) => userClient.client.clientName);
    if (isDashboard) {
      const total = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      });

      const totalSubmission = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SUBMITTED",
        },
      });

      const totalDroppedClient = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: {
            in: ["DROPPED_CLIENT"], // Enum values as strings
          },
        },
      });

      const totalDroppedInternal = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: {
            in: ["DROPPED_INTERNAL"], // Enum values as strings
          },
        },
      });

      const totalRejectedClient = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: {
            in: ["REJECTED_CLIENT"], // Enum values as strings
          },
        },
      });

      const totalRejectedInternal = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: {
            in: ["REJECTED_INTERNAL"], // Enum values as strings
          },
        },
      });

      const totalProposed = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          proposalDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "PROPOSED",
        },
      });

      const totalJoined = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          joiningDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "JOINED",
        },
      });

      const totalSelection = await this.prisma.proposal.count({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          selectionDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SELECTED",
        },
      });

      return [
        {
          total: total,
          totalSubmission: totalSubmission,
          totalJoined: totalJoined,
          totalProposed: totalProposed,
          totalSelection: totalSelection,
          totalDroppedClient: totalDroppedClient,
          totalDroppedInternal:totalDroppedInternal,
          totalRejectedClient:totalRejectedClient,
          totalRejectedInternal:totalRejectedInternal
        },
      ];
    } else {
      const proposalsForCM = await this.prisma.proposal.findMany({
        where: {
          OR: [
            {
              clientName: {
                in: clientNames, // Use the 'in' operator to match any of the client names
              },
            },
            {
              createdById: {
                in: [id], // Apply the OR condition for createdById
              },
            },
          ],
          createdAt: {
            gte: startDay ? startDay : monday,
            lte: endDay ? endDay : sunday,
          },
        },
      });

      return proposalsForCM;
    }
  }

  async findByRecruitmentManager(username: string, id: any, startDate: any, endDate: any, isDashboard?) {
    const monday = moment().startOf("isoWeek").toDate();
    const sunday = moment().endOf("isoWeek").toDate();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    // Fetch user details by username
    const userDetails = await this.prisma.employee.findUnique({
      where: { username: username },
    });

    // Fetch all RC details where reportsTo matches the user's ID
    const allRCDetails = await this.prisma.userRole.findMany({
      where: { reportsTo: userDetails.id },
      include: {
        users: {
          include: {
            proposalsCreated: {
              where: {
                createdAt: {
                  gte: startDate ? startDate : monday, // Greater than or equal to start date
                  lte: endDate ? endDate : sunday, // Less than or equal to end date
                },
              },
            },
          },
        },
      },
    });

    // Extract all usernames from the RC details
    const allUsername = allRCDetails.map((user) => user.username);

    // Fetch the list of users who report to the given recruitment manager
    const reportTo = await this.findReportToList(allUsername);

    let allProposals = allRCDetails.flatMap((userRole) => userRole.users.flatMap((user) => user.proposalsCreated));

    if (isDashboard) {
      const totalSub = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      createdAt: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalSubmission = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      createdAt: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "SUBMITTED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalDroppedClient = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      rejection_dropped_Date: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: {
                        in: ["DROPPED_CLIENT"], // Enum values as strings
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalDroppedCandidate = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      rejection_dropped_Date: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: {
                        in: [ "DROPPED_INTERNAL"], // Enum values as strings
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalRejectedClient = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      proposalDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "REJECTED_CLIENT",
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalRejectedInternal = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      proposalDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "REJECTED_INTERNAL",
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalProposed = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      proposalDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "PROPOSED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalJoined = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      joiningDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "JOINED",
                    },
                  },
                },
              },
            },
          },
        },
      });

      const totalSelection = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails.id },
        include: {
          users: {
            include: {
              _count: {
                select: {
                  proposalsCreated: {
                    where: {
                      selectionDate: {
                        gte: new Date(year, month - 1, 1),
                        lte: new Date(year, month, 0, 23, 59, 59),
                      },
                      submittedStatus: "SELECTED",
                    },
                  },
                },
              },
            },
          },
        },
      });
      const total = totalSub.flatMap((userRole) => userRole.users.map((user) => user._count));
      const submision = totalSubmission.flatMap((userRole) => userRole.users.map((user) => user._count));
      const proposed = totalProposed.flatMap((userRole) => userRole.users.map((user) => user._count));
      const selection = totalSelection.flatMap((userRole) => userRole.users.map((user) => user._count));
      const joined = totalJoined.flatMap((userRole) => userRole.users.map((user) => user._count));
      const droppedClient = totalDroppedClient.flatMap((userRole) => userRole.users.map((user) => user._count));
      const droppedInternal = totalDroppedCandidate.flatMap((userRole) => userRole.users.map((user) => user._count));
      const rejectedClient = totalRejectedClient.flatMap((userRole) => userRole.users.map((user) => user._count));
      const rejectedInternal = totalRejectedInternal.flatMap((userRole) => userRole.users.map((user) => user._count));

      if (id) {
        const tsSub = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
          },
        });

        if (total.length > 0) {
          total[0].proposalsCreated = total[0].proposalsCreated + tsSub;
        } else {
          total.push({ proposalsCreated: tsSub });
        }
        const sub = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: "SUBMITTED",
          },
        });
        if (submision.length > 0) {
          submision[0].proposalsCreated = submision[0].proposalsCreated + sub;
        } else {
          submision.push({ proposalsCreated: sub });
        }

        const dropCli = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            rejection_dropped_Date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: {
              in: ["DROPPED_CLIENT", "DROPPED_INTERNAL"], // Enum values as strings
            },
          },
        });
        if (droppedClient.length > 0) {
          droppedClient[0].proposalsCreated = droppedClient[0].proposalsCreated + dropCli;
        } else {
          droppedClient.push({ proposalsCreated: dropCli });
        }

        const dropInt = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            rejection_dropped_Date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: {
              in: ["DROPPED_INTERNAL"], // Enum values as strings
            },
          },
        });

        if (droppedInternal.length > 0) {
          droppedInternal[0].proposalsCreated = droppedInternal[0].proposalsCreated + dropInt;
        } else {
          droppedInternal.push({ proposalsCreated: dropInt });
        }

        const rejectedCli = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            rejection_dropped_Date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: {
              in: ["REJECTED_CLIENT"], // Enum values as strings
            },
          },
        });

        if (rejectedClient.length > 0) {
          rejectedClient[0].proposalsCreated = rejectedClient[0].proposalsCreated + rejectedCli;
        } else {
          rejectedClient.push({ proposalsCreated: rejectedCli });
        }

        const rejectedInt = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            rejection_dropped_Date: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: {
              in: ["REJECTED_INTERNAL"], // Enum values as strings
            },
          },
        });

        if (rejectedInternal.length > 0) {
          rejectedInternal[0].proposalsCreated = rejectedInternal[0].proposalsCreated + rejectedInt;
        } else {
          rejectedInternal.push({ proposalsCreated: rejectedInt });
        }

        const sel = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            selectionDate: {
              gte: new Date(year, month - 1, 1),
              lte: new Date(year, month, 0, 23, 59, 59),
            },
            submittedStatus: "SELECTED",
          },
        });
        if (selection.length > 0) {
          selection[0].proposalsCreated = selection[0].proposalsCreated + sel;
        } else {
          selection.push({ proposalsCreated: sel });
        }

        const join = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            joiningDate: {
              gte: startDate ? startDate : monday, // Greater than or equal to start date
              lte: endDate ? endDate : sunday, // Less than or equal to end date
            },
            submittedStatus: "JOINED",
          },
        });
        if (joined.length > 0) {
          joined[0].proposalsCreated = joined[0].proposalsCreated + join;
        } else {
          joined.push({ proposalsCreated: join });
        }

        const prop = await this.prisma.proposal.count({
          where: {
            createdById: {
              in: [...reportTo, id], // Match any of the IDs from reportTo array
            },
            createdAt: {
              gte: startDate ? startDate : monday, // Greater than or equal to start date
              lte: endDate ? endDate : sunday, // Less than or equal to end date
            },
            submittedStatus: "PROPOSED",
          },
        });
        if (proposed.length > 0) {
          proposed[0].proposalsCreated = proposed[0].proposalsCreated + prop;
        } else {
          proposed.push({ proposalsCreated: prop });
        }

        return [
          {
            total: total.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalSubmission: submision.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalJoined: joined.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalProposed: proposed.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalSelection: selection.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalDroppedClient: droppedClient.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalDroppedInternal: droppedInternal.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalRejectedClient: rejectedClient.reduce((sum, item) => sum + item.proposalsCreated, 0),
            totalRejectedInternal: rejectedInternal.reduce((sum, item) => sum + item.proposalsCreated, 0),
          },
        ];
      }
    }

    if (id) {
      // If reportTo has values, fetch additional proposals created by users in reportTo
      const data = await this.prisma.proposal.findMany({
        where: {
          createdById: {
            in: [...reportTo, id], // Match any of the IDs from reportTo array
          },
          createdAt: {
            gte: startDate ? startDate : monday, // Greater than or equal to start date
            lte: endDate ? endDate : sunday, // Less than or equal to end date
          },
        },
      });

      // If there are proposals in data, merge them into allProposals
      if (data && data.length > 0) {
        allProposals = [...allProposals, ...data];
      }
    }

    return allProposals || [];
  }

  async findByBusinessHead(userName: any, roleName: any, id: any, dateFrom, dateTo, isDashboard?) {
    const monday = moment().startOf("isoWeek").toDate();
    const sunday = moment().endOf("isoWeek").toDate();
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const createdByIds = [];

    // Step 1: Fetch the direct reporters
    const directReporter = await this.findReportToListForBH(userName, roleName);

    // Step 2: Extract usernames from direct reporter
    const usernames = directReporter.map((user) => user.username);

    // Step 3: Fetch second-level reporters using the usernames of the direct reporters
    const secondReporter = await this.findReportToListForBH(usernames, roleName);

    // Step 4: Fetch third-level reporters using the usernames of the second-level reporters
    const thirdReport = await this.findReportToListForBH(
      secondReporter.map((user) => user.username),
      roleName
    );

    // Step 5: Combine usernames from all levels (direct, second, third)
    createdByIds.push(...directReporter.map((user) => user.id)); // Add usernames of direct reporters
    createdByIds.push(...secondReporter.map((user) => user.id)); // Add usernames of second-level reporters
    createdByIds.push(...thirdReport.map((user) => user.id)); // Add usernames of third-level reporters

    if (isDashboard) {
      const total = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      });

      const totalSubmission = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SUBMITTED",
        },
      });

      const totalDroppedClient = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "DROPPED_CLIENT"
        },
      });

      const totalDroppedInternal = await this.prisma.proposal.count({
        where: {
          rejection_dropped_Date: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus:"DROPPED_INTERNAL"
        },
      });

      const totalRejectedClient = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_CLIENT",
        },
      });
      const totalRejectedInternal = await this.prisma.proposal.count({
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "REJECTED_INTERNAL",
        },
      });

      

      const totalJoined = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          joiningDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "JOINED",
        },
      });

      const totalProposed = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          proposalDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "PROPOSED",
        },
      });

      const totalSelection = await this.prisma.proposal.count({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          selectionDate: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
          submittedStatus: "SELECTED",
        },
      });

      return [
        {
          total: total,
          totalSubmission: totalSubmission,
          totalJoined: totalJoined,
          totalProposed: totalProposed,
          totalSelection: totalSelection,
          totalDroppedClient: totalDroppedClient,
          totalDroppedInternal:totalDroppedInternal,
          totalRejectedClient:totalRejectedClient,
          totalRejectedInternal:totalRejectedInternal
        },
      ];
    } else {
      const prop = this.prisma.proposal.findMany({
        where: {
          createdById: {
            in: [...createdByIds, id],
          },
          createdAt: {
            gte: dateFrom ? dateFrom : monday,
            lte: dateTo ? dateTo : sunday,
          },
        },
      });
      return prop; // Return the final list of usernames from all levels
    }
  }

  async searchProposalsByAllFilter(filterParams: any) {
    const {
      client,
      location,
      recruiter,
      dateFrom,
      dateTo,
      candidateName,
      status,
      role,
      username,
      id,
      profileId,
      email,
      selectionDateTo,
      selectionDateFrom,
      joiningDateFrom,
      joiningDateTo,
    } = filterParams;
    let recsIds;
    // Initialize filter object
    let filters: any = {};

    let formattedDateFrom, formattedDateTo;

    // If dateFrom and dateTo are null, assign week's start and end dates
    if (!dateFrom && !dateTo) {
      formattedDateFrom = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); // Monday as the start of the week
      formattedDateTo = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); // Sunday as the end of the week
    } else {
      formattedDateFrom = dateFrom ? format(new Date(dateFrom), "yyyy-MM-dd") : null;
      formattedDateTo = dateTo ? format(new Date(dateTo), "yyyy-MM-dd") : null;
    }

    // Convert to ISO String for Prisma filter
    if (formattedDateFrom) {
      const dateFrom = new Date(formattedDateFrom);
      dateFrom.setUTCHours(0, 0, 0, 0);
      formattedDateFrom = dateFrom.toISOString();
    }
    if (formattedDateTo) {
      formattedDateTo = new Date(new Date(formattedDateTo).setUTCHours(23, 59, 59, 999)).toISOString();
    }

    console.log(formattedDateFrom, formattedDateTo, "format");
    // Apply additional filters if they are provided
    if (client) filters.clientName = client;
    if (email) filters.email = email;
    if (location) filters.location = location;
    if (recruiter) filters.recruiter = recruiter;
    if (profileId) filters.profileId = profileId;
    if (candidateName) filters.candidateName = { contains: candidateName };
    if (status) filters.submittedStatus = status;
    if (id) filters.createdById = id; // Assuming 'createdById' is the correct field
    if (dateFrom && dateTo) {
      filters.createdAt = {
        gte: formattedDateFrom,
        lte: formattedDateTo,
      };
    }

    if (selectionDateFrom && selectionDateTo) {
      filters.selectionDate = {
        gte: selectionDateFrom,
        lte: selectionDateTo,
      };
    }
    if (joiningDateFrom && joiningDateTo) {
      filters.joiningDate = {
        gte: joiningDateFrom,
        lte: joiningDateTo,
      };
    }
    if (filters.recruiter && filters.recruiter.length > 0) {
      recsIds = await this.prisma.user.findMany({
        where: {
          username: {
            in: filters.recruiter,
          },
        },
        select: {
          id: true, // Only select the 'id' field
        },
      });

      recsIds = recsIds.map((item) => item.id);
    }

    const userDetails = await this.prisma.employee.findUnique({
      where: { username: username },
    });

    // Fetch all user roles that report to the user
    const allRCDetails = await this.prisma.userRole.findMany({
      where: { reportsTo: userDetails?.id }, // Optional chaining to handle potential null userDetails
    });

    // Map to extract usernames from the roles
    const allUserNames = allRCDetails.map((user) => user.username);

    // Handle filtering based on roles

    if (role === "Recruiter") {
      let recids = [];
      delete filters["createdById"];
      const allIds = await this.findReportToList(username);
      if (!allIds || !Array.isArray(allIds)) {
        throw new Error("findReportToList did not return a valid array of IDs");
      }

      const ids = [...allIds, id];

      if (filters.recruiter && filters.recruiter.length > 0) {
        delete filters["recruiter"];
        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: ids, // Using the merged list of IDs
            },
            ...filters, // Apply other filters
          },
        });
      }
    } else if (role === "Client Manager") {
      delete filters["createdById"];
      let data = {};

      // Fetch user details based on ID
      const userDetails = await this.prisma.user.findUnique({
        where: { id: id },
      });

      // Fetch user-client details based on userId
      const userClientDetails = await this.prisma.userClient.findMany({
        where: {
          userId: id, // Query based on userId
        },
        include: {
          client: true, // Include the client details if needed
        },
      });

      // If no user-client details found, throw an error
      if (!userClientDetails || userClientDetails.length === 0) {
        throw new Error("No details found for the given userId");
      }

      // Extract all client names from the userClientDetails array
      const clientNames = userClientDetails.map((userClient) => userClient.client.clientName);

      // Apply the recruiter filter if it's an array and if it's passed in the filters
      if (filters.recruiter && Array.isArray(filters.recruiter)) {
        // Ensure recsIds is defined and an array, otherwise handle error
        if (!Array.isArray(recsIds)) {
          throw new Error("recsIds must be an array.");
        }

        delete filters["recruiter"]; // Remove recruiter filter as it's handled separately

        return await this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            clientName: {
              in: clientNames, // Use the 'in' operator to match any of the client names
            },
            ...filters, // Apply any other filters if provided
          },
        });
      } else {
        // Otherwise, just apply the clientName filter and any other filters
        return await this.prisma.proposal.findMany({
          where: {
            clientName: {
              in: clientNames, // Use the 'in' operator to match any of the client names
            },
            ...filters, // Apply any additional filters passed
          },
        });
      }
    } else if (role === "Delivery Manager") {
      delete filters["createdById"];

      const userDetails = await this.prisma.employee.findUnique({
        where: { username: username },
      });

      // Fetch all user roles that report to the user
      const allRCDetails = await this.prisma.userRole.findMany({
        where: { reportsTo: userDetails?.id }, // Optional chaining to handle potential null userDetails
      });

      // Map to extract usernames from the roles
      const allUserNames = allRCDetails.map((user) => user.username);

      let secondLevel = await this.findReportToListForBH(allUserNames, "role");
      secondLevel = secondLevel.map((user) => user.id);
      // Fetch user details based on username
      // Fetch IDs of users whose usernames are in the extracted list
      const getIDs = await this.prisma.user.findMany({
        where: {
          username: {
            in: allUserNames,
          },
        },
        select: { id: true }, // Fetch only the IDs
      });
      // Extract the IDs from the result
      const userIDs = getIDs.map((user) => user.id);

      if (filters.recruiter && Array.isArray(filters.recruiter)) {
        delete filters["createdById"];
        delete filters["recruiter"];
        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: [...userIDs, ...secondLevel, id], // Use the array of IDs
            },
            ...filters, // Spread additional filters
          },
        });
      }
    } else if (role === "Business Head") {
      delete filters["createdById"];
      const createdByIds = [];
      // Step 1: Fetch the direct reporters
      const directReporter = await this.findReportToListForBH(username, "roleName");

      // Step 2: Extract usernames from direct reporter
      const usernames = directReporter.map((user) => user.username);

      // Step 3: Fetch second-level reporters using the usernames of the direct reporters
      const secondReporter = await this.findReportToListForBH(usernames, "roleName");

      // Step 4: Fetch third-level reporters using the usernames of the second-level reporters
      const thirdReport = await this.findReportToListForBH(
        secondReporter.map((user) => user.username),
        "roleName"
      );
      createdByIds.push(...directReporter.map((user) => user.id)); // Add usernames of direct reporters
      createdByIds.push(...secondReporter.map((user) => user.id)); // Add usernames of second-level reporters
      createdByIds.push(...thirdReport.map((user) => user.id));

      if (filters.recruiter && Array.isArray(filters.recruiter)) {
        delete filters["createdById"];
        delete filters["recruiter"];

        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        const prop = this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: [...createdByIds, id],
            },
            ...filters,
          },
        });
        return prop;
      }
    } else if (["Admin", "Finance Manager", "HR Manager"].includes(role)) {
      // If recsIds exist, ensure filters.createdById handles arrays

      if (filters.recruiter && Array.isArray(filters.recruiter)) {
        delete filters["createdById"];
        delete filters["recruiter"];
        return this.prisma.proposal.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        delete filters["createdById"];
        return this.prisma.proposal.findMany({
          where: {
            ...filters,
          },
        });
      }
    }
    // Default case for roles not explicitly handled
    return this.prisma.proposal.findMany({
      where: filters,
    });
  }

  async duplicateCheck(email: any) {
    return this.prisma.proposal.findMany({
      where: email,
    });
  }

  async getUserIds(ids: any) {
    return this.prisma.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findReportToListForBH(username: any, roleName: any) {
    const userIDsUsername = [];

    // Check if username is an array
    const userDetails = Array.isArray(username)
      ? await this.prisma.employee.findMany({
          where: { username: { in: username } },
        })
      : await this.prisma.employee.findUnique({
          where: { username: username },
        });

    if (!userDetails) {
      console.log("User not found");
      return [];
    }

    // If userDetails is an array (in case of multiple usernames), iterate through each user
    const userIds = Array.isArray(userDetails) ? userDetails.map((user) => user.id) : [userDetails.id]; // If it's a single user, wrap the id in an array

    // Fetch all user roles that report to the users
    const allRCDetails = await this.prisma.userRole.findMany({
      where: { reportsTo: { in: userIds } },
      include: {
        users: true,
      },
    });

    // Flatten all user IDs and usernames from the roles
    allRCDetails.forEach((roleDetail) => {
      const usersInRole = roleDetail.users.map((user) => ({
        id: user.id,
        username: user.username, // Including username
      }));
      userIDsUsername.push(...usersInRole); // Flatten and push both id and username into the main array
    });

    return userIDsUsername; // Return the array of all user IDs and usernames
  }

  async findReportToBasedonRole(username: string, roleName: string) {
    if (roleName === "Recruiter") {
      const list = await this.helperFnfindReportToBasedonRole(username);
      return [...list, username];
    }
    if (roleName === "Delivery Manager") {
      const list = [];
      const listLevel1 = await this.helperFnfindReportToBasedonRole(username);
      const secondReporter = await this.helperFnfindReportToBasedonRole(listLevel1);
      list.push([...listLevel1, ...secondReporter]);

      return [...list, username];
    }

    if (roleName === "Business Head") {
      const list = [];
      const listLevel1 = await this.helperFnfindReportToBasedonRole(username);
      const secondReporter = await this.helperFnfindReportToBasedonRole(listLevel1);
      const thirdReporter = await this.helperFnfindReportToBasedonRole(secondReporter);
      list.push([...listLevel1, ...secondReporter, ...thirdReporter]);

      return [...list, username];
    }
    if (roleName === "Client Manager") {
      const list = await this.prisma.userRole.findMany({
        include: { role: true, managerDetails: true },
      });

      const recruiterList = list
        .filter((user: any) => user.role) // First filter users who have a role
        .map((user: any) => user.username); // Map only usernames

      return recruiterList;
    }
    if (roleName === "Admin" || roleName === "Finance Manager" || roleName === "HR Manager") {
      const list = await this.prisma.userRole.findMany({ include: { role: true, managerDetails: true } });

      const mails = list
        .filter((user: any) => user.role.roleName !== "Admin" && user.role.roleName !== "Finance Manager")
        .map((user: any) => user.username);

      return [...mails, username];
    }
  }

  async helperFnfindReportToBasedonRole(username) {
    const userIDsUsername = [];

    // Check if username is an array
    const userDetails = Array.isArray(username)
      ? await this.prisma.employee.findMany({
          where: { username: { in: username } },
        })
      : await this.prisma.employee.findUnique({
          where: { username: username },
        });

    if (!userDetails) {
      console.log("User not found");
      return [];
    }

    // If userDetails is an array (in case of multiple usernames), iterate through each user
    const userIds = Array.isArray(userDetails) ? userDetails.map((user) => user.id) : [userDetails.id]; // If it's a single user, wrap the id in an array

    // Fetch all user roles that report to the users
    const allRCDetails = await this.prisma.userRole.findMany({
      where: { reportsTo: { in: userIds } },
      include: {
        users: true,
      },
    });

    // Flatten all user IDs from the roles
    allRCDetails.forEach((roleDetail) => {
      const userIdsInRole = roleDetail.users.map((user) => user.username); // Extract user ids
      userIDsUsername.push(...userIdsInRole); // Flatten and push the user IDs into the main array
    });

    return userIDsUsername; // Return the array of all user IDs
  }

  async getProfileByProfileId(profileId: string) {
    return this.prisma.proposal.findFirst({
      where: { 'profileId':profileId }
    });
  }
  
}

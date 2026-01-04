import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "@shared/util/prisma.service";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { SearchFutureJobProfileDto } from "./dto/search-future-job-profile.dto.ts";
import { ProposalStatus } from "@prisma/client";
import * as moment from "moment";
import { format, startOfWeek, endOfWeek } from "date-fns";

@Injectable()
export class FtutureJobService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfileDto) {
    try {
      const createData: any = {
        profileId: dto.profileId,
        name: dto.name,
        email: dto.email,
        contact: dto.contact,
        jobSkill: dto.jobSkill,
        jobRole: dto.jobRole,
        location: dto.location,
        nationality: dto.nationality,
        nativeLanguage: dto.nativeLanguage,
        jobLanguage: dto.jobLanguage,
        languageLevel: dto.languageLevel,
        noticePeriod: dto.noticePeriod,
        salary: dto.salary,
        salaryCurrency: dto.salaryCurrency,
        profileForClient: dto.profileForClient,
        profileForJobRole: dto.profileForJobRole,
        currentCompany: dto.currentCompany,
        education: dto.education,
        totalYearOfExp: dto.totalYearOfExp,
        profileSource: dto.profileSource,
        profileSourceLink: dto.profileSourceLink,
        availability: dto.availability,
        submittedBy: dto.submittedBy,
        recruiterNotes: dto.recruiterNotes,
        readyToRelocate: dto.readyToRelocate,
        availabilityDate: dto.availabilityDate,
        status: ProposalStatus.SUBMITTED,
        resume: dto.resume,
        createdById: dto.createdById || null,
      };

      // Add jobOrder relation only if jobOrderId is provided
      if (dto.jobOrderId) {
        createData.jobOrder = { connect: { id: dto.jobOrderId } };
      }

      const profile = await this.prisma.futureJobsProfile.create({
        data: createData,
      });

      return profile;
    } catch (error) {
      console.error("Error creating profile:", error);
      throw new InternalServerErrorException("Failed to create profile");
    }
  }

  async update(id: string, dto: UpdateProfileDto) {
    try {
      const updateData: any = {
        name: dto.name,
        email: dto.email,
        contact: dto.contact,
        jobSkill: dto.jobSkill,
        jobRole: dto.jobRole,
        location: dto.location,
        nationality: dto.nationality,
        nativeLanguage: dto.nativeLanguage,
        jobLanguage: dto.jobLanguage,
        languageLevel: dto.languageLevel,
        noticePeriod: dto.noticePeriod,
        salary: dto.salary,
        salaryCurrency: dto.salaryCurrency,
        profileForClient: dto.profileForClient,
        profileForJobRole: dto.profileForJobRole,
        currentCompany: dto.currentCompany,
        education: dto.education,
        totalYearOfExp: dto.totalYearOfExp,
        profileSource: dto.profileSource,
        profileSourceLink: dto.profileSourceLink,
        availability: dto.availability,
        lastUpdate: new Date(),
        recruiterNotes: dto.recruiterNotes,
        readyToRelocate: dto.readyToRelocate,
        availabilityDate: dto.availabilityDate,
        //profileStory: dto.profileStory,
        resume: dto.resume,
        status: dto.status,
      };

      // Handle jobOrderId relation
      if (dto.jobOrderId !== undefined) {
        if (dto.jobOrderId) {
          updateData.jobOrder = { connect: { id: dto.jobOrderId } };
        } else {
          updateData.jobOrder = { disconnect: true };
        }
      }

      const updated = await this.prisma.futureJobsProfile.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new InternalServerErrorException("Failed to update profile");
    }
  }
  findAll() {
    return this.prisma.futureJobsProfile.findMany();
  }

  findOne(id: string) {
    return this.prisma.futureJobsProfile.findUnique({ where: { id } });
  }
  remove(id: string) {
    return this.prisma.futureJobsProfile.delete({ where: { id } });
  }

  // removeByProfileId(profileId: string) {
  //   return this.prisma.futureJobsProfile.delete({
  //     where: { profileId: profileId }, // OK if profileId is marked as `@unique`
  //   });
  // }

  async searchProposalsByAllFilter(filterParams: any) {
    const {
      profileId,
      resumeSubmissionFrom,
      resumeSubmissionTo,
      currentJobRole,
      profileForClient,
      availabilityFrom,
      availabilityTo,
      nationality,
      willingToRelocate,
      currentLocation,
      nativeLanguage,
      jobLanguage,
      recruiter,
      role,
      username,
      id,
      emailId,
      name
    } = filterParams;
    let recsIds;
    // Initialize filter object
    let filters: any = {};

    let formattedDateFrom, formattedDateTo;

    // If dateFrom and dateTo are null, assign week's start and end dates
    if (!resumeSubmissionFrom && !resumeSubmissionTo) {
      formattedDateFrom = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); // Monday as the start of the week
      formattedDateTo = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); // Sunday as the end of the week
    } else {
      formattedDateFrom = resumeSubmissionFrom ? format(new Date(resumeSubmissionFrom), "yyyy-MM-dd") : null;
      formattedDateTo = resumeSubmissionTo ? format(new Date(resumeSubmissionTo), "yyyy-MM-dd") : null;
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
    if (profileForClient) filters.profileForClient = profileForClient;
    if (currentJobRole) filters.currentJobRole = currentJobRole;
    if (nationality) filters.nationality = nationality;
    if (willingToRelocate) filters.willingToRelocate = willingToRelocate;
    if (currentLocation) filterParams.location = currentLocation;
    if (emailId) filters.email = emailId;
    if (name) {
      filters.name = {
        contains: name
      };
    }
    if (nativeLanguage) filters.nativeLanguage = nativeLanguage;
    if (jobLanguage) filters.jobLanguage = jobLanguage;
    

    if (recruiter) filters.recruiter = recruiter;
    if (profileId) filters.profileId = profileId;
    // if (status) filters.status = status;
    if (id) filters.createdById = id; // Assuming 'createdById' is the correct field
    if (resumeSubmissionFrom && resumeSubmissionTo) {
      filters.createdAt = {
        gte: formattedDateFrom,
        lte: formattedDateTo,
      };
    }

    if (availabilityFrom && availabilityTo) {
      filters.availabilityDate = {
        gte: availabilityFrom,
        lte: availabilityTo,
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
        return this.prisma.futureJobsProfile.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        return this.prisma.futureJobsProfile.findMany({
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

        return await this.prisma.futureJobsProfile.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            profileForClient: {
              in: clientNames, // Use the 'in' operator to match any of the client names
            },
            ...filters, // Apply any other filters if provided
          },
        });
      } else {
        // Otherwise, just apply the clientName filter and any other filters
        return await this.prisma.futureJobsProfile.findMany({
          where: {
            profileForClient: {
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
        return this.prisma.futureJobsProfile.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        return this.prisma.futureJobsProfile.findMany({
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
        const prop = this.prisma.futureJobsProfile.findMany({
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
        return this.prisma.futureJobsProfile.findMany({
          where: {
            createdById: {
              in: recsIds, // Match any of the IDs from recsIds array
            },
            ...filters,
          },
        });
      } else {
        delete filters["createdById"];
        return this.prisma.futureJobsProfile.findMany({
          where: {
            ...filters,
          },
        });
      }
    }
    // Default case for roles not explicitly handled
    return this.prisma.futureJobsProfile.findMany({
      where: filters,
    });
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
}

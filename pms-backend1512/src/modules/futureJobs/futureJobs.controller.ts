import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, Put } from "@nestjs/common";
import { CreateProfileDto } from "./dto/create-profile.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FtutureJobService } from "./futureJobs.service";
import { MyFileRequestInterceptor } from "@shared/util/req.interceptor";
import { FileUtil } from "@shared/util/fileutil.helpers";
import { UploadType } from "@shared/util/file-validator.util";
import { S3Util } from "@shared/util/s3.util";
import { NodeEmailService } from "@shared/util/sendgridService";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SearchFutureJobProfileDto } from "./dto/search-future-job-profile.dto.ts";
import { ProposalService } from "@modules/proposal/proposal.service";
import { ProposalStatus } from "@prisma/client";
import { Roles } from "@shared/decorators/roles.decorator";

@ApiTags("futurejobs")
@Controller("futurejobs")
export class FutureJobController {
  constructor(
    private readonly profileService: FtutureJobService,
    private readonly fileUtil: FileUtil,
    private readonly sendGridService: NodeEmailService,
    private s3util: S3Util,
    private proposalService: ProposalService
  ) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        contact: { type: "string" },
        jobSkill: { type: "string" },
        jobRole: { type: "string" },
        location: { type: "string" },
        readyToRelocate: { type: "string" },
        nationality: { type: "string" },
        nativeLanguage: { type: "string" },
        jobLanguage: { type: "string" },
        languageLevel: { type: "string" },
        noticePeriod: { type: "string" },
        salary: { type: "string" },
        salaryCurrency: { type: "string" },
        profileForClient: { type: "string" },
        profileForJobRole: { type: "string" },
        currentCompany: { type: "string" },
        education: { type: "string" },
        totalYearOfExp: { type: "string" },
        profileSource: { type: "string" },
        profileSourceLink: { type: "string" },
        availability: { type: "string" },
        availabilityDate: { type: "string", format: "date-time" },
        recruiterNotes: { type: "string" },
        profileStory: { type: "string" },
        submittedBy: { type: "string" },
        //lastUpdate: { type: 'string', format: 'date-time' },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @UseInterceptors(
    new MyFileRequestInterceptor({
      numericFields: [],
      fileFieldName: "file",
      isMultiple: false,
    })
  )
  async create(@Body() payload: { data: any; fileDetails: any }) {
    const currentYear = new Date().getFullYear();
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    payload.data["profileId"] = `MPS${currentYear}-${randomCode}`;

    if (payload.fileDetails?.file?.filename) {
      try {
        const savedPath = await this.fileUtil.saveFile(payload.fileDetails.file, UploadType.FUTURE_JOB);
        if (!savedPath) throw new Error("File could not be saved");
        payload.data["resume"] = String(savedPath);
      } catch (error) {
        console.error("File Save Error:", error);
        throw new BadRequestException("Failed to save file.");
      }
    }

    const profileDto = plainToInstance(CreateProfileDto, payload.data);
    const errors = await validate(profileDto);

    if (errors.length > 0) {
      console.error("Validation Errors:", errors);
      throw new BadRequestException("Payload validation failed.");
    }

    return this.profileService.create(payload.data);
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Update a profile" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        contact: { type: "string" },
        jobSkill: { type: "string" },
        jobRole: { type: "string" },
        location: { type: "string" },
        readyToRelocate: { type: "string" },
        nationality: { type: "string" },
        nativeLanguage: { type: "string" },
        jobLanguage: { type: "string" },
        languageLevel: { type: "string" },
        noticePeriod: { type: "string" },
        salary: { type: "string" },
        salaryCurrency: { type: "string" },
        profileForClient: { type: "string" },
        profileForJobRole: { type: "string" },
        currentCompany: { type: "string" },
        education: { type: "string" },
        totalYearOfExp: { type: "string" },
        profileSource: { type: "string" },
        profileSourceLink: { type: "string" },
        availability: { type: "string" },
        availabilityDate: { type: "string", format: "date-time" },
        recruiterNotes: { type: "string" },
        profileStory: { type: "string" },
        submittedBy: { type: "string" },
        lastUpdate: { format: "date-time" },
        status: { format: "string" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @UseInterceptors(
    new MyFileRequestInterceptor({
      numericFields: [],
      fileFieldName: "file",
      isMultiple: false,
    })
  )
  async update(@Param("id") id: string, @Body() payload: { data: any; fileDetails: any }) {
    try {
      // Step 1: Handle file upload
      if (payload.fileDetails?.file?.filename) {
        const savedPath = await this.fileUtil.saveFile(payload.fileDetails.file, UploadType.FUTURE_JOB);
        if (!savedPath) throw new Error("File could not be saved");
        payload.data["resume"] = String(savedPath);
      }
  
      // Step 2: Validate DTO
      const updateDto = plainToInstance(CreateProfileDto, payload.data);
      const errors = await validate(updateDto);
      if (errors.length > 0) {
        throw new BadRequestException("Payload validation failed.");
      }
  
      // Step 3: If status === PROPOSED → create or update proposal
      if (payload.data["status"] === "PROPOSED") {
        const data = {
          profileId: payload.data["profileId"],
          clientName: payload.data["profileForClient"],
          location: payload.data["location"],
          remarks: payload.data["recruiterNotes"],
          candidateName: payload.data["name"],
          roleApplied: payload.data["jobRole"],
          nationality: payload.data["nationality"],
          email: payload.data["email"],
          contact: payload.data["contact"],
          noticePeriod: payload.data["noticePeriod"],
          passportValidity: null,
          currentSalary: Number(payload.data["salary"]),
          primarySkills: payload.data["jobSkill"],
          createdBy: payload.data["createdById"],
          attachment: payload.data["resume"],
          proposedTo: "",
          submittedStatus: ProposalStatus.SUBMITTED,
          currentLocation: payload.data["location"],
          university: null,
          educationLevel: payload.data["education"],
          visaType: null,
          interviewAvailable: null,
          totalYearsExperience: parseInt(payload.data["totalYearOfExp"]),
          relevantYearsExperience: null,
          reasonForJobChange: null,
          passport: null,
          currentJobDetails: payload.data["currentCompany"],
          jobLanguage: payload.data["jobLanguage"],
          proficiency: null,
          proficiencyEnglish: null,
          billingCurrency: null,
          billingNo: null,
          selectionDate: null,
          joiningDate: null,
          salaryCurrency: payload.data["salaryCurrency"],
          invoiceDate: null,
          invoiceNo: null,
          proposalDate: new Date(),
          nativeLanguage: payload.data["nativeLanguage"],
        };
  
        const checkUpdate = await this.proposalService.getProfileByProfileId(payload.data["profileId"]);
  
        if (checkUpdate) {
          const currentYear = new Date().getFullYear();
          const randomCode = Math.floor(10000 + Math.random() * 90000);
          const profileId = `MPS${currentYear}-${randomCode}`;
          data["updatedBy"] = checkUpdate.createdById;
          data["profileId"] = profileId;
          await this.proposalService.create(data); // no return here
        } else {
          await this.proposalService.create(data); // no return here
        }
      }
  
      // Step 4: Always update profile
      const updatedProfile = await this.profileService.update(id, payload.data);
      return { data: updatedProfile, message: "Profile updated successfully" };
  
    } catch (error) {
      console.error("Update Error:", error);
      throw new BadRequestException(error.message || "Update failed");
    }
  }
  

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Delete(":id")
  @ApiOperation({ summary: "Delete a profile" })
  remove(@Param("id") id: string) {
    return this.profileService.remove(id);
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get()
  @ApiOperation({ summary: "Get all profiles" })
  findAll() {
    return this.profileService.findAll();
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get(":id")
  @ApiOperation({ summary: "Get a profile by ID" })
  findOne(@Param("id") id: string) {
    return this.profileService.findOne(id);
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Post("searchRecords")
  @ApiBody({ type: SearchFutureJobProfileDto }) // Swagger documentation for the DTO
  async searchRecords(@Body() filterParams: SearchFutureJobProfileDto) {
    console.log(filterParams, "filers");
    let proposals = await this.profileService.searchProposalsByAllFilter(filterParams);

    if (proposals) {
      const ids = proposals.map((profile) => profile.createdById);
      const userDetails = await this.proposalService.getUserIds(ids);
      const mappedProposals = proposals.map((p) => {
        const user = userDetails.find((u) => u.id === p.createdById);
        return {
          ...p,
          createdByName: user ? `${user.firstName.trim()} ${user.lastName.trim()}` : null,
        };
      });
      proposals = mappedProposals;
    }
    return proposals;
  }
}

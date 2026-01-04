import { writeFileSync } from "node:fs";
import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Res,
  Param,
  Delete,
  Put,
  HttpException,
  HttpStatus,
  UseInterceptors,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { FastifyRequest, FastifyReply } from "fastify";

import { MyFileRequestInterceptor } from "@shared/util/req.interceptor";
import { FileUtil } from "@shared/util/fileutil.helpers";
import { UploadType } from "@shared/util/file-validator.util";
import { Roles } from "@shared/decorators/roles.decorator";

import { ProposalService } from "./proposal.service";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { UsernameDto } from "./dto/create-proposal.dto";
import { UpdateProposalDto } from "./dto/update-proposal.dto";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { ProposalFilterDto } from "./dto/filter-proposal.dto";
import { EmailCheckDto, SearchRecordsDto } from "./dto/search-record.dto";
import { AuthService } from "@modules/auth/auth.service";
import { NodeEmailService } from "@shared/util/sendgridService";
import { S3Util } from "@shared/util/s3.util";
import { ResourceAuthorizationHelper } from "@shared/util/resource-authorization.helper";
import { sub } from "date-fns";
@ApiTags("Proposal")
@Controller("proposal")
export class ProposalController {
  constructor(
    private readonly proposalService: ProposalService,
    private readonly fileUtil: FileUtil,
    private readonly sendGridService:NodeEmailService,
    private s3util:S3Util,
    private readonly resourceAuthHelper: ResourceAuthorizationHelper
  ) { }

  // Create Proposal with file upload
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        clientName: { type: "string" },
        location: { type: "string" },
        remarks: { type: "string" },
        candidateName: { type: "string" },
        roleApplied: { type: "string" },
        nationality: { type: "string" },
        email: { type: "string" },
        contact: { type: "string" },
        noticePeriod: { type: "string" },
        passportValidity: { type: "string", format: "date" },
        currentSalary: { type: "number" },
        expectedSalary: { type: "number" },
        primarySkills: { type: "string" },
        createdBy: { type: "string" },
        submittedStatus: {
          type: "string",
          enum: ["PROPOSED", 
            "REJECTED_CLIENT",
            "REJECTED_INTERNAL",
            "DROPPED_CLIENT",
            "DROPPED_INTERNAL",
            "PENDING_SUBMISSION", 
            "IN_PROCESS",
            "JOINED",
            "SUBMITTED", 
            "SELECTED"], // Define the enum values
        },
        proposedTo: { type: "string" },
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    new MyFileRequestInterceptor({
      numericFields: ["currentSalary"],
      dateFields: ["passportValidity"],
      fileFieldName: "file",
      isMultiple: false,
    })
  )
  async create(@Body() payload: { data: any; fileDetails: any }) {
    // Generate Profile ID in the desired format
    const currentYear = new Date().getFullYear();
    const randomCode = Math.floor(10000 + Math.random() * 90000); // Generate a random 5-digit code
    const profileId = `MPS${currentYear}-${randomCode}`;

    // Add the profile ID to the data
    payload.data["profileId"] = profileId;

    if (payload.fileDetails) {
      const fileBData = payload.fileDetails["file"];

      // Ensure file exists and filename is defined
      if (fileBData && fileBData.filename) {
       // const filePath = `./uploads/${Date.now()}-${fileBData.filename}`;

        try {
          // Save the file
          //const uploadedFilePath = await this.fileUtil.saveFile(fileBData, filePath);
          const uploadedFilePath = await this.fileUtil.saveFile(fileBData, UploadType.PROPOSAL);
          if (!uploadedFilePath) {
            throw new Error("File could not be saved");
          }

          payload.data["attachment"] = String(uploadedFilePath);
        } catch (error) {
          console.error("Error saving file:", error);
          throw new BadRequestException("Failed to save file.");
        }
      } else {
        console.error("File data or filename missing in fileBData");
        throw new BadRequestException("Invalid file data.");
      }
    }

    // Manually validating payload as actual payload has been modified with custom interceptor.
    const pdata = plainToInstance(CreateProposalDto, payload.data);
    const validationErrors = await validate(pdata);

    if (validationErrors.length > 0) {
      console.error("Validation Errors:", validationErrors);
      throw new BadRequestException("Payload validation failed");
    }

    // Store the proposal details along with the file path and profileId
    const createdProposal = await this.proposalService.create(pdata);

    return createdProposal;
  }

  // Get all proposals
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get()
  async findAll() {
    const allProp = await this.proposalService.findAll();
    return allProp;
  }

  // Get proposal by ID
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get(":id")
  async findOne(@Param("id") id: string, @Res() res: FastifyReply) {
    const proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
    }

    // Check if file exists in the location
    const filePath = proposal.attachment;
    let fileDownloadUrl = null;

    if (filePath && existsSync(filePath)) {
      fileDownloadUrl = `/proposal/${id}/download`; // URL to download the file
    }

    // Return the proposal data with the download link
    return (res as any).code(HttpStatus.OK).send({
      ...proposal,
      fileDownloadUrl, // Include the download link in the response
    });
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get(":id/download")
  async downloadFile(@Param("id") id: string, @Res() res: FastifyReply) {
    const proposal = await this.proposalService.findOne(id);

    if (!proposal) {
      throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
    }

    const filePath = proposal.attachment;

    if (filePath && existsSync(filePath)) {
      const fileStream = createReadStream(join(process.cwd(), filePath));

      // Get the file extension to set the appropriate content type
      const fileExtension = filePath.split(".").pop();
      const contentType = fileExtension === "pdf" ? "application/pdf" : "application/octet-stream";

      (res as any).header("Content-Disposition", `attachment; filename="${filePath.split("/").pop()}"`);
      (res as any).header("Content-Type", contentType);

      // Pipe the file to the response
      fileStream.on("error", (err) => {
        console.error("File Stream Error:", err);
        throw new HttpException("Error reading file", HttpStatus.INTERNAL_SERVER_ERROR);
      });

      // Use the Fastify response object to pipe the file stream
      return fileStream.pipe((res as any).raw);
    } else {
      throw new HttpException("File not found", HttpStatus.NOT_FOUND);
    }
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        clientName: { type: "string" },
        location: { type: "string" },
        remarks: { type: "string" },
        candidateName: { type: "string" },
        roleApplied: { type: "string" },
        nationality: { type: "string" },
        email: { type: "string" },
        contact: { type: "string" },
        noticePeriod: { type: "string" },
        passportValidity: { type: "string", format: "date" },
        currentSalary: { type: "number" },
        primarySkills: { type: "string" },
        submittedStatus: { type: "string" },
        createdBy: { type: "number" },
        proposedTo: { type: "string" },
        file: { type: "string", format: "binary" },
        updatedById: { type: "string" },
      },
    },
  })
  @UseInterceptors(
    new MyFileRequestInterceptor({
      numericFields: ["currentSalary"],
      dateFields: ["passportValidity"],
      fileFieldName: "file",
      isMultiple: false,
    })
  )
  async update(
    @Param("id") id: string,
    @Body() payload: { data: any; fileDetails: any },
    @Req() request: FastifyRequest
  ) {
    const proposal = await this.proposalService.findOne(id);
    if (!proposal) {
      throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
    }

    // Check ownership/authorization
    const userId = (request as any).user?.id;
    if (userId) {
      await this.resourceAuthHelper.canUserAccessResource(
        userId,
        id,
        'edit',
        'proposal',
      );
    }

    // Retain the existing file path unless a new file is uploaded
    let updatedAttachment = proposal.attachment;

    if (payload.fileDetails) {
      const fileBData = payload.fileDetails["file"];
      if (fileBData && fileBData.filename) {
        //const filePath = `./uploads/${Date.now()}-${fileBData.filename}`;
        try {
          const uploadedFilePath = await this.fileUtil.saveFile(fileBData, UploadType.PROPOSAL);
          //const uploadedFilePath = await this.fileUtil.saveFile(fileBData, filePath);
          if (!uploadedFilePath) {
            throw new Error("File could not be saved");
          }
          updatedAttachment = String(uploadedFilePath);
        } catch (error) {
          console.error("Error saving file:", error);
          throw new BadRequestException("Failed to save file.");
        }
      }
    }

    // Add the attachment path to the payload
    payload.data["attachment"] = updatedAttachment;

    // Validate the updated payload
    const pdata = plainToInstance(UpdateProposalDto, payload.data);
    const validationErrors = await validate(pdata);

    if (validationErrors.length > 0) {
      console.error("Validation Errors:", validationErrors);
      throw new BadRequestException("Payload validation failed");
    }

    // Update the proposal in the database
    const updatedProposal = await this.proposalService.update(id, pdata);

    return updatedProposal;
  }

  // Delete proposal by ID
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Delete(":id")
  async remove(@Param("id") id: string, @Req() request: FastifyRequest) {
    const proposal = await this.proposalService.findOne(id);
    if (!proposal) {
      throw new HttpException("Proposal not found", HttpStatus.NOT_FOUND);
    }

    // Check ownership/authorization
    const userId = (request as any).user?.id;
    if (userId) {
      await this.resourceAuthHelper.canUserAccessResource(
        userId,
        id,
        'delete',
        'proposal',
      );
    }

    return this.proposalService.remove(id);
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Post("proposalByFilter")
  @ApiBody({ type: ProposalFilterDto }) // Automatically document the filter DTO in Swagger
  async findProposalByFilter(@Body() filterParams: ProposalFilterDto) {
    const { role, reportsTo, id,dateFrom,dateTo,isDashboard  } = filterParams;
    const userDetails = await this.proposalService.findUserDetailsFromId(id);
    const rolename = userDetails.role.roleName;
    let proposals = [];
  

    if (rolename === "Recruiter") {
      proposals = await this.proposalService.findByCreatedBy(id,userDetails.username,rolename,dateFrom,dateTo,isDashboard);
    }
    if (rolename === "Client Manager") {
      proposals = await this.proposalService.findByClientId(id,dateFrom,dateTo,isDashboard);
    }
    if (rolename === "Delivery Manager") {
      
      proposals = await this.proposalService.findByRecruitmentManager(userDetails.username,filterParams.id,dateFrom,dateTo,isDashboard);
    }
    if(rolename ==='Business Head'){
     
      proposals = await this.proposalService.findByBusinessHead(userDetails.username,rolename,id,dateFrom,dateTo,isDashboard);
    }
    if (rolename === "Admin" || rolename === "Finance Manager" || rolename ==="HR Manager") {
      proposals = await this.proposalService.findAllByWeek(dateFrom,dateTo,isDashboard);
    }
   if(isDashboard){
    return proposals
   }
    if(proposals){
      const ids = proposals.map((profile)=>profile.createdById);
      
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

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Post('searchRecord')
  @ApiBody({ type: SearchRecordsDto }) // Swagger documentation for the DTO
  async searchRecords(@Body() filterParams: SearchRecordsDto) {
    let proposals = await this.proposalService.searchProposalsByAllFilter(filterParams);
 
    if(proposals){
      const ids = proposals.map((profile)=>profile.createdById);
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

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Post('email-check')
  @ApiBody({ type: EmailCheckDto })
  async searchByEmailId(@Body() filterParams: EmailCheckDto) {
    const proposals = await this.proposalService.duplicateCheck(filterParams);
    return proposals;
  }
  
  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 emails per hour per user
  @Post('send-email')
  @ApiBody({ type:Object })
  async sendEmail(@Body() body:any) {
    const { fromDate,toDate,from,toMail, subject,messageBody,cc } = body;
    const formatedMailData = this.generateEmailContent(from,fromDate,toDate,messageBody);
    // You can add any validation logic here (e.g., validate email format)
    if (!toMail || !subject || !messageBody) {
      throw new Error('Missing required fields: to, subject, or body');
    }
    try {
      // Send email using the SendGrid service
      const result = await this.sendGridService.sendEmail(from,toMail, subject, formatedMailData,cc);
      return { status: 'success', message: 'Email sent successfully', result };
    } catch (error) {
      throw new Error('Failed to send email: ' + error.message);
    }
  }

  @Roles('Admin', 'HR Manager', 'Finance Manager', 'Delivery Manager', 'Business Head', 'Client Manager')
  @Put('get-Recruiter')
  @ApiBody({ description: 'Username of the User', type: UsernameDto })  // Use DTO as the type
  async getReportToonRole(@Body() usernameDto: UsernameDto) {
    const proposals = await this.proposalService.findReportToBasedonRole(usernameDto.username,usernameDto.roleName);
    return proposals;
  }

  @Roles('Admin', 'HR Manager', 'Recruiter', 'Client Manager', 'Delivery Manager', 'Business Head', 'Finance Manager')
  @Get('download-url')
  async getDownloadUrl(@Query('fileKey') fileKey: string) {
    const url = await this.s3util.generatePresignedUrl(fileKey);
    return { url };
}

generateEmailContent(name:any,fromDate:any,dateTo:any,proposalData: any[]): string {
  const fields = [
    { label: "Profile Id", key: "profileId" },
    {label:"Submission Date",key:'createdAt'},
    { label: "Name", key: "candidateName" },
    { label: "Nationality", key: "nationality" },
    { label: "Role", key: "roleApplied" },
    { label: "Client", key: "clientName" },
    { label: "Location", key: "location" },
    { label: "Status", key: "submittedStatus" },
    { label: "Submitted By", key: "createdByName" },
  ];

  let proposalsContent = `
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr>
          ${fields.map(field => `<th>${field.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${proposalData.map(proposal => `
          <tr>
            ${fields.map(field => `<td>${proposal[field.key] ?? 'N/A'}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  return proposalsContent;
}



}

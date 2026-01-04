import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Roles } from "@shared/decorators/roles.decorator";

@ApiTags("client")
@Controller("client")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Roles('Admin', 'HR Manager', 'Client Manager')
  @Post()
  @ApiOperation({ summary: "Create a new client" })
  @ApiResponse({ status: 201, description: "The client has been successfully created.", type: CreateClientDto })
  @ApiResponse({ status: 400, description: "Bad request." })
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all clients" })
  @ApiResponse({ status: 200, description: "List of all clients", type: [CreateClientDto] })
  findAll() {
    return this.clientService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a client by ID" })
  @ApiResponse({ status: 200, description: "The client with the given ID", type: CreateClientDto })
  @ApiResponse({ status: 404, description: "Client not found" })
  findOne(@Param("id") id: string) {
    return this.clientService.findOne(id);
  }

  @Roles('Admin', 'HR Manager', 'Client Manager')
  @Put(":id")
  @ApiOperation({ summary: "Update a client by ID" })
  @ApiResponse({ status: 200, description: "The client has been successfully updated.", type: UpdateClientDto })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiResponse({ status: 404, description: "Client not found" })
  update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Roles('Admin')
  @Delete(":id")
  @ApiOperation({ summary: "Delete a client by ID" })
  @ApiResponse({ status: 200, description: "The client has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Client not found" })
  remove(@Param("id") id: string) {
    return this.clientService.remove(id);
  }
}

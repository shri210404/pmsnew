import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from "@nestjs/common";
import { CountryService } from "./country.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Roles } from "@shared/decorators/roles.decorator";

@ApiTags("country")
@Controller("country")
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Roles('Admin')
  @Post()
  @ApiOperation({ summary: "Create a new country" })
  @ApiResponse({ status: 201, description: "The country has been successfully created.", type: CreateCountryDto })
  @ApiResponse({ status: 400, description: "Bad request." })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all countries" })
  @ApiResponse({ status: 200, description: "List of all countries", type: [CreateCountryDto] })
  findAll() {
    return this.countryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a country by ID" })
  @ApiResponse({ status: 200, description: "The country with the given ID", type: CreateCountryDto })
  @ApiResponse({ status: 404, description: "Country not found" })
  findOne(@Param("id") id: string) {
    return this.countryService.findOne(id);
  }

  @Roles('Admin')
  @Put(":id")
  @ApiOperation({ summary: "Update a country by ID" })
  @ApiResponse({ status: 200, description: "The country has been successfully updated.", type: UpdateCountryDto })
  @ApiResponse({ status: 400, description: "Bad request." })
  @ApiResponse({ status: 404, description: "Country not found" })
  update(@Param("id") id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Roles('Admin')
  @Delete(":id")
  @ApiOperation({ summary: "Delete a country by ID" })
  @ApiResponse({ status: 200, description: "The country has been successfully deleted." })
  @ApiResponse({ status: 404, description: "Country not found" })
  remove(@Param("id") id: string) {
    return this.countryService.remove(id);
  }
}

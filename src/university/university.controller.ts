import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UniversityService } from './university.service';

@Controller('/university')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  @Post()
  async createUniversity(@Body() body: { name: string; description: string }) {
    console.log('Received POST request:', body); // Debug log
    return this.universityService.createUniversity(body.name, body.description);
  }

  @Get()
  async getAllUniversities() {
    return this.universityService.getAllUniversities();
  }

  @Get(':id')
  async getUniversityById(@Param('id') id: string) {
    return this.universityService.getUniversityById(id);
  }

  @Get('list')
  async listUniversities() {
    return this.universityService.getAllUniversities(); // Fetch all universities
  }

  @Put(':id')
  async updateUniversity(@Param('id') id: string, @Body() updateData: Partial<{ name: string; description: string }>) {
    return this.universityService.updateUniversity(id, updateData);
  }

  @Delete(':id')
  async deleteUniversity(@Param('id') id: string) {
    return this.universityService.deleteUniversity(id);
  }
}

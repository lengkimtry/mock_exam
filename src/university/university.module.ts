import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { UniversitySchema } from './schemas/university.schema'; // Fixed path

@Module({
  imports: [MongooseModule.forFeature([{ name: 'University', schema: UniversitySchema }])],
  controllers: [UniversityController],
  providers: [UniversityService],
})
export class UniversityModule {}

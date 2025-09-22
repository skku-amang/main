import { Injectable } from "@nestjs/common"
import { CreatePerformanceDto } from "./dto/create-performance.dto"
import { UpdatePerformanceDto } from "./dto/update-performance.dto"

@Injectable()
export class PerformanceService {
  create(createPerformanceDto: CreatePerformanceDto) {
    return "This action adds a new performance"
  }

  findAll() {
    return `This action returns all performance`
  }

  findOne(id: number) {
    return `This action returns a #${id} performance`
  }

  update(id: number, updatePerformanceDto: UpdatePerformanceDto) {
    return `This action updates a #${id} performance`
  }

  remove(id: number) {
    return `This action removes a #${id} performance`
  }
}

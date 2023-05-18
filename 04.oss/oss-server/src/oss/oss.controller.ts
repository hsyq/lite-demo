import { Controller, Get } from '@nestjs/common';
import { OssService } from './oss.service';
@Controller('oss')
export class OssController {
  constructor(private oss: OssService) {}

  @Get('signature')
  getOssSignature() {
    return this.oss.getSignature();
  }
}
import { Controller, Get, Post, Headers, Body } from '@nestjs/common';
import { OssService } from './oss.service';
@Controller('oss')
export class OssController {
  constructor(private oss: OssService) {}

  // 请求 Policy 和签名
  @Get('signature')
  getOssSignature() {
    return this.oss.getSignature();
  }

  // 接收 OSS 回调
  @Post('result')
  getResult(
    @Headers('x-oss-pub-key-url') xOssPubKeyUrl: string,
    @Body() file: any,
  ) {
    return this.oss.getResult(xOssPubKeyUrl, file);
  }
}

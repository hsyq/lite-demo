import { Module } from '@nestjs/common';
import { OssModule } from './oss/oss.module';

@Module({
  imports: [OssModule],
})
export class AppModule {}

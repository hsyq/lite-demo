import { Injectable } from '@nestjs/common';
import * as Client from 'ali-oss';
import * as dayjs from 'dayjs';

@Injectable()
export class OssService {
  async getSignature() {
    const config = {
      accessKeyId: 'accessKeyId',
      accessKeySecret: 'accessKeyId',
      // 存储桶名字
      bucket: 'kw-tuku',
      // 文件存储路径
      dir: 'images/',
    };

    const client = new Client(config);

    const date = new Date();
    // 时长加 1 天，作为签名的有限期
    date.setDate(date.getDate() + 1);

    const policy = {
      // 设置签名的有效期，格式为Unix时间戳
      expiration: date.toISOString(),
      conditions: [
        ['content-length-range', 0, 10485760000], // 设置上传文件的大小限制
      ],
    };

    // 生成签名，策略等信息
    const formData = await client.calculatePostSignature(policy);

    // bucket域名，客户端将向此地址发送请求
    const location = await client.getBucketLocation();
    const host = `http://${config.bucket}.${location.location}.aliyuncs.com`;

    // 响应给客户端的签名和策略等信息
    return {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      dir: config.dir,
    };
  }
}

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
      bucket: 'kw-tuku1',
      // 文件存储路径
      dir: 'images/',
      // 设置上传回调URL，即回调服务器地址，用于处理应用服务器与OSS之间的通信。
      // OSS会在文件上传完成后，把文件上传信息通过此回调URL发送给应用服务器。
      // 例如callbackUrl填写为https oss-demo.aliyuncs.com:23450。
      callbackUrl: 'http://kunwu.tech:3000/oss/result',
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

    // 上传回调。
    const callback = {
      // 设置回调请求的服务器地址
      callbackUrl: config.callbackUrl,
      // 设置回调的内容，${object} 等占位符会由 OSS 进行填充
      // ${object}表示文件的存储路径，${mimeType}表示资源类型，对于图片类型的文件，可以通过${imageInfo.height}等去设置宽高信息
      callbackBody:
        'filename=${object}&size=${size}&mimeType=${mimeType}&height=${imageInfo.height}&width=${imageInfo.width}',
      // 设置回调的内容类型，也支持 application/json
      callbackBodyType: 'application/x-www-form-urlencoded',
    };

    // 响应给客户端的签名和策略等信息
    return {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      dir: config.dir,
      // 传给客户端的回调参数，需要通过Buffer.from 对 JSON 进行 Base64 编码
      callback: Buffer.from(JSON.stringify(callback)).toString('base64'),
    };
  }

  async getResult(xOssPubKeyUrl: string, file: any) {
    // 通过 Base64 解码公钥地址
    const pubKeyAddr = Buffer.from(xOssPubKeyUrl, 'base64').toString('ascii');

    //  判断请求头中的 x-oss-pub-key-url 是否来源于OSS服务器
    if (!pubKeyAddr.startsWith('https://gosspublic.alicdn.com/')) {
      // 如果不是来源于OSS服务器，则返回 “verify not ok”，表明回调失败
      return {
        status: 'verify not ok',
      };
    }
    // 如果 x-oss-pub-key-url 来源于OSS服务器，则返回“Ok”和文件信息，表明回调成功
    return {
      status: 'Ok',
      file,
    };
  }
}

import request, { http } from '@/utils/request'
import type { AxiosPromise } from 'axios'
import type { LoginData, LoginRes, UserInfoRes} from './types'

// const enum USER_API {
//   Login = '/user/login',
//   Userinfo = '/user/info',
// }

/**
 * 登录
 */
export function login(data: LoginData) {
  return http.post<LoginRes>('/user/login', data);
}

// 使用原生 axios 实例进行请求
export function loginRaw(data: LoginData): Promise<LoginRes> {
  return request.post('/user/login', data);
}

/**
 * 获取登录用户信息
 */
export function getUserInfo() {
  return http.get<UserInfoRes>('/user/info')
}

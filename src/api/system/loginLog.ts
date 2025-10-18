import axios from 'axios';

// 查询登录日志列表
export function listLoginLog(query: any) {
    return axios({
        url: '/system/loginLog/list',
        method: 'get',
        params: query
    })
}

// 删除登录日志
export function delLoginLog(infoId: number | string) {
    return axios({
        url: `/system/loginLog/${infoId}`,
        method: 'delete'
    })
}

// 解锁用户登录状态
export function unlockLoginLog(userName: string) {
    return axios({
        url: `/system/loginLog/unlock/${userName}`,
        method: 'get'
    })
}

// 清空登录日志
export function cleanLoginLog() {
    return axios({
        url: '/system/loginLog/clean',
        method: 'delete'
    })
}

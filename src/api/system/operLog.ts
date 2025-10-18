import axios from 'axios';

export interface OperLogRecord {
    createBy?: any;
    createTime?: any;
    updateBy?: any;
    updateTime?: any;
    remark?: any;
    operId: number;
    title: string;
    businessType: number;
    businessTypes?: any;
    method: string;
    requestMethod: string;
    operatorType: number;
    operName: string;
    deptName?: any;
    operUrl: string;
    operIp: string;
    operLocation: string;
    operParam: string;
    jsonResult: string;
    status: number;
    errorMsg?: any;
    operTime: string;
    costTime: number;
}

// 查询操作日志列表
export function listOperLog(query: any) {
    return axios({
        url: '/system/operLog/list',
        method: 'get',
        params: query
    })
}

// 删除操作日志
export function delOperLog(operId: number | string) {
    return axios({
        url: `/system/operLog/${operId}`,
        method: 'delete'
    })
}

// 清空操作日志
export function cleanOperLog() {
    return axios({
        url: '/system/operLog/clean',
        method: 'delete'
    })
}

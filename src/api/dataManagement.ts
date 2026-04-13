// Parameter interface
import { post, get} from "./index.ts";
import {postByXXL} from "./xxlJob.ts";

export interface DayLoadParams {
    /* */
    id?: number;

    /*任务ID */
    taskId?: number;

    day?: number;

    /*数据导入日期 */
    importDay?: string | number;

    /*数据量 */
    size?: number;

    /*创建时间 */
    createTime?: string | number;

    /*修改时间 */
    modifyTime?: string | number;

    /* */
    pageSize?: number;

    /* */
    page?: number;
}
// Response interface
/**
 * [
 {
 taskId	任务ID	integer(int64)	integer(int64)
 importDay	数据导入日期	string(date-time)	string(date-time)
 size	数据量	integer(int32)	integer(int32)
 createTime	创建时间	string(date-time)	string(date-time)
 modifyTime	修改时间	string(date-time)	string(date-time)
 }
 ]
 */
export interface DayLoadRes {
    id?: number;
    taskId?: number;
    importDay?: string | number;
    size?: number;
    createTime?: string | number;
    modifyTime?: string | number;
}

/**
 * 列表查询
 * @param {object} params 【交易公共数据】任务执行情况-实体
 * @param {number} params.id
 * @param {number} params.taskId 任务ID
 * @param {object} params.importDay 数据导入日期
 * @param {number} params.size 数据量
 * @param {object} params.createTime 创建时间
 * @param {object} params.modifyTime 修改时间
 * @param {number} params.pageSize
 * @param {number} params.page
 * @returns
 */
export function getDayLoadDataList(params: DayLoadParams): Promise<DayLoadRes[]> {
    return get(`/pubtaskinfo/list`, params);
}

// XXL-Job 任务管理接口
export interface TaskInfoParams {
//     jobGroup=5&triggerStatus=-1&jobDesc=&executorHandler=&author=&start=0&length=1
    start?: number;
    length?: number;
    jobGroup?: number |  string;
    jobDesc?: string;
    executorHandler?: string;
    author?: string;
    triggerStatus?: number | string;

}

export interface TaskInfoRes {
    id?: number;
    jobGroup?: number;
    jobDesc?: string;
    addTime?: string | number;
    updateTime?: string | number;
    author?: string;
    alarmEmail?: string;
    scheduleType?: string;
    scheduleConf?: string;
    misfireStrategy?: string;
    executorRouteStrategy?: string;
    executorHandler?: string;
    executorParam?: string;
    executorBlockStrategy?: string;
    executorTimeout?: number;
    executorFailRetryCount?: number;
    glueType?: string;
    glueSource?: string;
    glueRemark?: string;
    glueUpdatetime?: string | number;
    childJobId?: string;
    triggerStatus?: number;
    triggerLastTime?: number;
    triggerNextTime?: number;
}

export interface TaskPageRes {
    recordsFiltered: number;
    recordsTotal: number;
    data: TaskInfoRes[];
}

/**
 * XXL-Job 任务列表查询
 * @param {TaskInfoParams} params 任务查询参数
 * @returns {TaskPageRes} 分页结果
 */
export function getTaskInfoList(params: TaskInfoParams): Promise<TaskPageRes> {
    return postByXXL(`/jobinfo/pageList`, params);
}


//xxl-job-admin/jobgroup/pageList  获取采集器列表
// {
//     "recordsFiltered": 5,
//     "data": [
//         {
//             "id": 5,
//             "appname": "collect-data-local",
//             "title": "数据采集",
//             "addressType": 0,
//             "addressList": null,
//             "updateTime": "2026-04-01T15:49:53.000+00:00",
//             "registryList": null
//         }
//     ],
//     "recordsTotal": 5
// }
export interface JobGroupParams {
    start?: number;
    length?: number;
    appname: string;
    title: string;
}

export interface JobGroupRes {
    id?: number;
    appname?: string;
    title?: string;
    addressType?: number;
    addressList?: string;
    updateTime?: string | number;
    registryList?: string;
}

export interface JobGroupPageRes {
    recordsFiltered: number;
    recordsTotal: number;
    data: JobGroupRes[];
}
// 获取执行器列表
export function getJobGroupList(params: JobGroupParams): Promise<JobGroupPageRes> {
    return postByXXL(`/jobgroup/pageList`, params);
}


export interface TaskUpdateParams {
    id: number;
    jobGroup: number;
    jobDesc?: string;
    author?: string;
    alarmEmail?: string;
    scheduleType?: string;
    scheduleConf?: string;
    cronGen_display?: string;
    schedule_conf_CRON?: string;
    schedule_conf_FIX_RATE?: string;
    schedule_conf_FIX_DELAY?: string;
    executorHandler?: string;
    executorParam?: string;
    executorRouteStrategy?: string;
    childJobId?: string;
    misfireStrategy?: string;
    executorBlockStrategy?: string;
    executorTimeout?: number;
    executorFailRetryCount?: number;
}
/**
 * 更新任务
 * @param {TaskInfoRes} params 任务信息
 * @returns
 */
export function updateTaskInfo(params: TaskUpdateParams): Promise<any> {
    return postByXXL(`/jobinfo/update`, params);
}

/**
 * 手动触发任务
 * @param {number} id 任务 ID
 * @param {string} executorParam 执行器参数
 * @param {string} addressList 执行器地址列表
 * @returns
 */
export function triggerJob(params: {
    id: number;
    executorParam?: string;
    addressList?: string;
}): Promise<any> {
    return postByXXL(`/jobinfo/trigger`, params);
}

/**
 * 启动任务
 * @param {number} id 任务 ID
 * @returns
 */
export function startJob(id: number): Promise<any> {
    return postByXXL(`/jobinfo/start`, { id });
}

/**
 * 停止任务
 * @param {number} id 任务 ID
 * @returns
 */
export function stopJob(id: number): Promise<any> {
    return postByXXL(`/jobinfo/stop`, { id });
}


export const getDayLoadConfigList = (): Promise<any[]> => {
    return post("/pubtask/tree");
}

// 保存每日导入配置
export const saveDayLoadConfig = (data: any): Promise<any> => {
    return post("/pubtask/batch/update", data);
}
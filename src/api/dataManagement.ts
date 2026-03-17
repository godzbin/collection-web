// Parameter interface
import {post} from "./index.ts";

export interface DayLoadParams {
    /* */
    id?: number;

    /*任务ID */
    taskId?: number;

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
    return post(`/pubtaskinfo/list`, params);
}
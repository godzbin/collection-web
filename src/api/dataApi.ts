import {get, post} from "./index.ts";
// Parameter interface
export interface PubNodeAvgPrice {
    /* */
    id?: number;

    /*日期 */
    day?: any;

    /*单位 */
    unit?: string;

    /*json数据类型：24点电价 */
    price?: any;

    /*json数据类型：96点电价 */
    price96?: any;

    /*日期节点电价类型：1.日前；2.实时 */
    type?: any;

    /*创建时间 */
    createTime?: any;

    /*修改时间 */
    modifyTime?: any;

    /* */
    pageSize?: number;

    /* */
    page?: number;
}

/**
 * [
 {
 "id": 1,
 "day": 1767196800000,
 "unit": "电价(元/MWh)",
 "price": {
 "00:00": 262.376803,
 "01:00": 256.83073763,
 "02:00": 256.26114753,
 "03:00": 249.14055435,
 "04:00": 222.5820874,
 "05:00": 221.01654839,
 "06:00": 238.96279523,
 "07:00": 243.40662694,
 "08:00": 235.7251571,
 "09:00": 197.66444113,
 "10:00": 28.71642651,
 "11:00": -44.18620531,
 "12:00": -45.43663687,
 "13:00": -45.15402131,
 "14:00": -45.43776454,
 "15:00": -31.73071687,
 "16:00": 143.84770314,
 "17:00": 252.10817895,
 "18:00": 270.87356356,
 "19:00": 269.68631094,
 "20:00": 273.59296678,
 "21:00": 274.94085049,
 "22:00": 265.13848592,
 "23:00": 246.91499819
 },
 "price96": {
 "00:00": 232.7789888,
 "00:15": 279.26589021,
 "00:30": 272.3912351,
 "00:45": 265.07109787,
 "01:00": 259.12587577,
 "01:15": 257.15809317,
 "01:30": 254.88278801,
 "01:45": 256.15619357,
 "02:00": 260.87539184,
 "02:15": 252.99796316,
 "02:30": 252.98273384,
 "02:45": 258.18850126,
 "03:00": 254.26936439,
 "03:15": 248.83560852,
 "03:30": 248.8124377,
 "03:45": 244.64480679,
 "04:00": 237.3334164,
 "04:15": 213.23355724,
 "04:30": 230.24405923,
 "04:45": 209.51731672,
 "05:00": 218.58615023,
 "05:15": 223.74785121,
 "05:30": 217.8124377,
 "05:45": 223.91975442,
 "06:00": 223.85402672,
 "06:15": 243.86082701,
 "06:30": 240.54785121,
 "06:45": 247.58847598,
 "07:00": 240.874684,
 "07:15": 242.71511737,
 "07:30": 244.77729144,
 "07:45": 245.25941495,
 "08:00": 243.84233297,
 "08:15": 243.63123149,
 "08:30": 233.53767786,
 "08:45": 221.88938606,
 "09:00": 217.50233297,
 "09:15": 218.48397616,
 "09:30": 199.65527627,
 "09:45": 155.01617913,
 "10:00": 154.26566631,
 "10:15": 4.56457566,
 "10:30": 1.47097869,
 "10:45": -45.43551463,
 "11:00": -40.43548935,
 "11:15": -45.43551463,
 "11:30": -45.43551463,
 "11:45": -45.43830264,
 "12:00": -45.43551463,
 "12:15": -45.43551463,
 "12:30": -45.44000361,
 "12:45": -45.43551463,
 "13:00": -45.43551463,
 "13:15": -45.43551463,
 "13:30": -44.30954135,
 "13:45": -45.43551463,
 "14:00": -45.43551463,
 "14:15": -45.43551463,
 "14:30": -45.44001445,
 "14:45": -45.44001445,
 "15:00": -44.56007584,
 "15:15": -45.43551463,
 "15:30": -43.33728422,
 "15:45": 6.41000722,
 "16:00": -13.48896352,
 "16:15": 159.62890213,
 "16:30": 210.43908631,
 "16:45": 218.81178765,
 "17:00": 236.48070423,
 "17:15": 251.27936439,
 "17:30": 258.38488985,
 "17:45": 262.28775731,
 "18:00": 270.38592994,
 "18:15": 270.30219213,
 "18:30": 272.74019502,
 "18:45": 270.06593716,
 "19:00": 270.05097147,
 "19:15": 269.70305164,
 "19:30": 269.19770675,
 "19:45": 269.7935139,
 "20:00": 270.32841459,
 "20:15": 272.09589382,
 "20:30": 273.40567714,
 "20:45": 278.54188155,
 "21:00": 277.70654749,
 "21:15": 276.28898519,
 "21:30": 271.62052365,
 "21:45": 274.14734561,
 "22:00": 267.46832792,
 "22:15": 265.69104731,
 "22:30": 266.0296533,
 "22:45": 261.36491513,
 "23:00": 259.07302997,
 "23:15": 246.91414951,
 "23:30": 246.91828819,
 "23:45": 234.7545251
 },
 "type": 1,
 "createTime": 1770169549000,
 "modifyTime": 1773164641000
 }
 ]
 */


/**
 * 列表查询
 * @param {object} params 【交易公共数据】节点平均电价-实体
 * @param {number} params.id
 * @param {object} params.day 日期
 * @param {string} params.unit 单位
 * @param {object} params.price json数据类型：24点电价
 * @param {object} params.price96 json数据类型：96点电价
 * @param {object} params.type 日期节点电价类型：1.日前；2.实时
 * @param {object} params.createTime 创建时间
 * @param {object} params.modifyTime 修改时间
 * @param {number} params.pageSize
 * @param {number} params.page
 * @returns
 */
export function getPubNodeAvgPrice(params: PubNodeAvgPrice): Promise<PubNodeAvgPrice[]> {
    return post(`/pubnodeavgprice/list`, params);
}


// Parameter interface
export interface PubLoadReality {
    /* */
    id?: number;

    /*日期 */
    day?: any;

    /*负荷类型 */
    name?: string;

    /*json数据类型：负荷 */
    load?: any;

    /*创建时间 */
    createTime?: any;

    /*修改时间 */
    modifyTime?: any;

    /* */
    pageSize?: number;

    /* */
    page?: number;
}


/**
 * 列表查询
 * @param {object} params 【交易公共数据】负荷实际信息-实体
 * @param {number} params.id
 * @param {object} params.day 日期
 * @param {string} params.name 负荷类型
 * @param {object} params.load json数据类型：负荷
 * @param {object} params.createTime 创建时间
 * @param {object} params.modifyTime 修改时间
 * @param {number} params.pageSize
 * @param {number} params.page
 * @returns
 */
export function getPubLoadReality(params: PubLoadReality): Promise<PubLoadReality[]> {
    return post(`/publoadreality/list`, params);
}

// Parameter interface
export interface PubLoadPrediction {
    /* */
    id?: number;

    /*日期 */
    day?: any;

    /*负荷类型 */
    name?: string;

    /*json数据类型：负荷 */
    load?: any;

    /*创建时间 */
    createTime?: any;

    /*修改时间 */
    modifyTime?: any;

    /* */
    pageSize?: number;

    /* */
    page?: number;
}


/**
 * 分页查询
 * @param {object} params 【交易公共数据】负荷预测信息-实体
 * @param {number} params.id
 * @param {object} params.day 日期
 * @param {string} params.name 负荷类型
 * @param {object} params.load json数据类型：负荷
 * @param {object} params.createTime 创建时间
 * @param {object} params.modifyTime 修改时间
 * @param {number} params.pageSize
 * @param {number} params.page
 * @returns
 */
export function getPubLoadPrediction(params: PubLoadPrediction): Promise<PubLoadPrediction[]> {
    return post(`/publoadprediction/list`, params);
}

/*
type	日志类型，仅支持 info 或 error，默认 info,示例值(info)	query	false
string
date	日志日期，格式 yyyy-MM-dd；不传时默认读取当天日志	query	false
string
cursor	向更早日志翻页的游标。首次查询可不传，后续传上一次返回的 nextCursor	query	false
integer(int64)
 */
interface LogParams {
    type?: string;
    date?: string;
    cursor?: string;
}
/*
参数名称
参数说明
类型
schema
type	日志类型，仅支持 info 或 error	string
logDate	实际读取的日志日期，格式 yyyy-MM-dd	string
filePath	日志文件路径	string
cursor	本次查询使用的日志游标	integer(int64)	integer(int64)
nextCursor	下一次向更早日志翻页时应传入的游标	integer(int64)	integer(int64)
hasMore	是否还有更早的日志内容	boolean
lines	当前页日志内容，按时间倒序返回，第一行是最新日志	array
 */
export interface Log {
    type?: string;
    logDate?: string;
    filePath?: string;
    cursor?: string;
    nextCursor?: string;
    hasMore?: boolean;
    lines?: any[];
}
// 加载日志
export function getLoadLog(params: LogParams): Promise<Log> {
    return get(`/file/logback/realtime`, params);
}
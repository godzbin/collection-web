// ==================== 【港华】Excel 导入 ====================
// 接口清单见 src/港华相关Excel导入接口清单.md
// 所有接口均为 POST multipart/form-data：file + day(毫秒时间戳)
import request from "../utils/request.ts";

/**
 * 导入类型定义
 */
export interface ImportTypeInfo {
  /* CrawlCode 枚举名 */
  crawlCode: string;
  /* 编码 */
  code: number;
  /* 页面展示名称 */
  label: string;
  /* 接口路径 */
  url: string;
  /* 导入模版说明 */
  template: string;
  /* 是否有 type 参数（0=竖表 1=横表） */
  hasTypeParam: boolean;
  /* 返回值是否为 BatchImportBo（有导入统计） */
  hasBatchResult: boolean;
}

/**
 * 导入接口清单（来自 港华相关Excel导入接口清单.md）
 */
export const IMPORT_TYPE_LIST: ImportTypeInfo[] = [
  {
    crawlCode: "PUB_NODE_PRICE",
    code: 300002,
    label: "日前节点电价",
    url: "/pubnodeprice/import",
    template: "日前节点电价模版.xlsx",
    hasTypeParam: false,
    hasBatchResult: false,
  },
  {
    crawlCode: "GRID_PUBLIC_DATA",
    code: 300003,
    label: "信息披露-预测信息",
    url: "/pub/prediction/import",
    template: "yc-2025-03-30.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "GRID_PUBLIC_DATA_REAL",
    code: 300004,
    label: "信息披露-实际信息",
    url: "/pub/real/import",
    template: "real-2025-03-30.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "REAL_NODE_PRICE",
    code: 300005,
    label: "实时节点电价",
    url: "/pubrealtimenodeprice/import",
    template: "实时节点电价模版.xlsx",
    hasTypeParam: false,
    hasBatchResult: false,
  },
  {
    crawlCode: "REAL_SETTLEMENT_PRICE",
    code: 300006,
    label: "日前交易结果",
    url: "/pubusersettlement/import",
    template: "日前用户侧统一结算电价模版（type=0 竖表 / type=1 横表）",
    hasTypeParam: true,
    hasBatchResult: false,
  },
  {
    crawlCode: "PUB_REALTIME_USER_SETTLEMENT",
    code: 300007,
    label: "实时交易结果",
    url: "/pubrealtimeusersettlement/import",
    template: "实时用户侧统一结算电价模版.xlsx",
    hasTypeParam: false,
    hasBatchResult: false,
  },
  {
    crawlCode: "GRID_PUBLIC_DATA_AREA",
    code: 300008,
    label: "信息披露(区域)-预测信息",
    url: "/pub/area/prediction/import",
    template: "yc-2025-03-30.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "GRID_PUBLIC_DATA_AREA_REAL",
    code: 300009,
    label: "信息披露(区域)-实际信息",
    url: "/pub/area/real/import",
    template: "real-2025-03-30.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "MARKET_ELECTRICITY_DEMAND",
    code: 300012,
    label: "市场用电信息",
    url: "/pubmarketelectricitydata/import",
    template: "市场用电信息.xlsx",
    hasTypeParam: false,
    hasBatchResult: false,
  },
  {
    crawlCode: "DAY_AHEAD_CLEARING_POWER",
    code: 300013,
    label: "日前-现货分时分类型出清电量",
    url: "/pubspotclearingelectricitydayahead/import",
    template: "日前现货分时分类型出清电量.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "DAY_AHEAD_CLEARING_POWER_REAL",
    code: 300014,
    label: "实时-现货分时分类型出清电量",
    url: "/pubrealspotclearingelectricitydayahead/import",
    template: "实时现货分时分类型出清电量.xlsx",
    hasTypeParam: false,
    hasBatchResult: true,
  },
  {
    crawlCode: "TRAN_PARAMETER",
    code: 300015,
    label: "交易参数管理外",
    url: "/pubtranparameter/import",
    template: "售电公司销量数据模版.xlsx",
    hasTypeParam: false,
    hasBatchResult: false,
  },
  {
    crawlCode: "REAL_RUN_RESULT",
    code: 300016,
    label: "实际运行结果",
    url: "/pubrealrunresult/import",
    template: "-",
    hasTypeParam: false,
    hasBatchResult: false,
  },
];

/**
 * BatchImportBo 导入结果统计
 */
export interface BatchImportBo {
  /* 总条数 */
  total?: number;
  /* 成功条数 */
  success?: number;
  /* 失败条数 */
  fail?: number;
  /* 失败信息 */
  errorMsg?: string;
  [key: string]: any;
}

/**
 * Excel 导入上传参数
 */
export interface ExcelImportParams {
  file: File;
  /* 日期时间戳（毫秒） */
  day: number;
  /* 模版类型：0=竖表，1=横表（仅日前交易结果需要） */
  type?: number;
}

/**
 * Excel 导入
 * @param url 接口路径
 * @param params 上传参数
 * @returns BatchImportBo 或 void
 */
export function uploadExcel(
  url: string,
  params: ExcelImportParams
): Promise<BatchImportBo | void> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("day", String(params.day));
  if (params.type !== undefined) {
    formData.append("type", String(params.type));
  }
  return request({
    url,
    method: "POST",
    data: formData,
    // 浏览器自动携带 boundary，不要手动设置
    headers: { "Content-Type": "multipart/form-data" },
  });
}

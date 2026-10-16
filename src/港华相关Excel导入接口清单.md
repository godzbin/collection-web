# 港华相关Excel导入接口清单

> 每个 CrawlCode 枚举值对应一个 Excel 导入接口，供前端对接使用。
> 所有接口均为 **POST** 请求，Content-Type 为 `multipart/form-data`。

## 公共参数说明

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | MultipartFile | 是 | Excel文件 |
| day | Long | 是 | 日期时间戳（毫秒） |

---

## 接口列表

### 1. 日前节点电价查询（PUB_NODE_PRICE / 300002）

- **接口路径**：`POST /pubnodeprice/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/日前节点电价模版.xlsx`
- **返回值**：`void`

---

### 2. 信息披露查询预测信息（GRID_PUBLIC_DATA / 300003）

- **接口路径**：`POST /pub/prediction/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/yc-2025-03-30.xlsx`
- **返回值**：`BatchImportBo`

---

### 3. 信息披露查询实际信息（GRID_PUBLIC_DATA_REAL / 300004）

- **接口路径**：`POST /pub/real/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/real-2025-03-30.xlsx`
- **返回值**：`BatchImportBo`

---

### 4. 实时节点电价查询（REAL_NODE_PRICE / 300005）

- **接口路径**：`POST /pubrealtimenodeprice/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/实时节点电价模版.xlsx`
- **返回值**：`void`

---

### 5. 日前交易结果查询（REAL_SETTLEMENT_PRICE / 300006）

- **接口路径**：`POST /pubusersettlement/import`
- **参数**：`file` + `day` + `type`
- **导入模版**：
  - type=0：`pub/日前用户侧统一结算电价模版.xlsx`（竖表）
  - type=1：`pub/日前用户侧统一结算电价横表模版.xlsx`（横表）
- **返回值**：`void`

| 额外参数 | 类型 | 必填 | 默认值 | 说明 |
|----------|------|------|--------|------|
| type | Byte | 否 | 0 | 模版类型：0=竖表，1=横表 |

---

### 6. 实时交易结果查询（PUB_REALTIME_USER_SETTLEMENT / 300007）

- **接口路径**：`POST /pubrealtimeusersettlement/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/实时用户侧统一结算电价模版.xlsx`
- **返回值**：`void`

---

### 7. 信息披露(区域)查询预测信息（GRID_PUBLIC_DATA_AREA / 300008）

- **接口路径**：`POST /pub/area/prediction/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/yc-2025-03-30.xlsx`
- **返回值**：`BatchImportBo`

---

### 8. 信息披露(区域)查询实际信息（GRID_PUBLIC_DATA_AREA_REAL / 300009）

- **接口路径**：`POST /pub/area/real/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/real-2025-03-30.xlsx`
- **返回值**：`BatchImportBo`

---

### 9. 市场用电信息（MARKET_ELECTRICITY_DEMAND / 300012）

- **接口路径**：`POST /pubmarketelectricitydata/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/市场用电信息(2026-01-02).xlsx`
- **返回值**：`void`

---

### 10. 日前-现货分时分类型出清电量（DAY_AHEAD_CLEARING_POWER / 300013）

- **接口路径**：`POST /pubspotclearingelectricitydayahead/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/日前现货分时分类型出清电量2026-01-27.xlsx`
- **返回值**：`BatchImportBo`

---

### 11. 实时-现货分时分类型出清电量（DAY_AHEAD_CLEARING_POWER_REAL / 300014）

- **接口路径**：`POST /pubrealspotclearingelectricitydayahead/import`
- **参数**：`file` + `day`
- **导入模版**：`pub/实时现货分时分类型出清电量2026-01-01.xlsx`
- **返回值**：`BatchImportBo`

---

### 12. 交易参数管理外（TRAN_PARAMETER / 300015）

- **接口路径**：`POST /pubtranparameter/import`
- **参数**：`file` + `day`
- **导入模版**：`sest/售电公司销量数据模版.xlsx`
- **返回值**：`void`

---

### 13. 实际运行结果（REAL_RUN_RESULT / 300016）

- **接口路径**：`POST /pubrealrunresult/import`
- **参数**：`file` + `day`
- **返回值**：`void`

---

## 汇总表

| 序号 | CrawlCode | 编码 | 接口路径 | 导入模版 |
|------|-----------|------|---------|---------|
| 1 | PUB_NODE_PRICE | 300002 | POST /pubnodeprice/import | 日前节点电价模版.xlsx |
| 2 | GRID_PUBLIC_DATA | 300003 | POST /pub/prediction/import | yc-2025-03-30.xlsx |
| 3 | GRID_PUBLIC_DATA_REAL | 300004 | POST /pub/real/import | real-2025-03-30.xlsx |
| 4 | REAL_NODE_PRICE | 300005 | POST /pubrealtimenodeprice/import | 实时节点电价模版.xlsx |
| 5 | REAL_SETTLEMENT_PRICE | 300006 | POST /pubusersettlement/import | 日前用户侧统一结算电价模版.xlsx |
| 6 | PUB_REALTIME_USER_SETTLEMENT | 300007 | POST /pubrealtimeusersettlement/import | 实时用户侧统一结算电价模版.xlsx |
| 7 | GRID_PUBLIC_DATA_AREA | 300008 | POST /pub/area/prediction/import | yc-2025-03-30.xlsx |
| 8 | GRID_PUBLIC_DATA_AREA_REAL | 300009 | POST /pub/area/real/import | real-2025-03-30.xlsx |
| 9 | MARKET_ELECTRICITY_DEMAND | 300012 | POST /pubmarketelectricitydata/import | 市场用电信息.xlsx |
| 10 | DAY_AHEAD_CLEARING_POWER | 300013 | POST /pubspotclearingelectricitydayahead/import | 日前现货分时分类型出清电量.xlsx |
| 11 | DAY_AHEAD_CLEARING_POWER_REAL | 300014 | POST /pubrealspotclearingelectricitydayahead/import | 实时现货分时分类型出清电量.xlsx |
| 12 | TRAN_PARAMETER | 300015 | POST /pubtranparameter/import | 售电公司销量数据模版.xlsx |
| 13 | REAL_RUN_RESULT | 300016 | POST /pubrealrunresult/import | - |

---

## 注意事项

1. `day` 参数为**日期时间戳**（毫秒级），如 `1711728000000` 表示 2025-03-30 00:00:00
2. 第5个接口（日前交易结果）有额外的 `type` 参数，用于区分竖表和横表模版
3. 返回 `BatchImportBo` 的接口会返回导入结果统计（成功/失败条数等），返回 `void` 的接口成功时无返回体

---

*更新时间: 2026-10-16*

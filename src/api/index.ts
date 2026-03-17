import { ElMessage } from "element-plus";
import { getToken } from "../utils/auth";
// import { AxiosPromise } from "axios";
import request from "../utils/request";
import axios, {  AxiosRequestConfig } from "axios";

export const get = <T, K>(url: string, query?: T): Promise<K> => {
  return request<K>({
    url: url,
    method: "GET",
    params: query,
  });
};

export const post = <T, K>(url: string, param?: T): Promise<K> => {
  return request<K>({
    url: url,
    method: "POST",
    data: param,
  });
};

export const remove = (url: string, query: any, params?: any) => {
  return request<number>({
    url,
    method: "DELETE",
    params: query,
    data: params
  });
};

/**
 * 统一处理下载文件函数
 * @param {Object} config request's config - include HTTP method, url, parameters etc.
 */
export const downloadPromise = <T>(config: AxiosRequestConfig<T>) => {
  return new Promise((resolve, reject) => {
    config.responseType = "blob";
    config.headers = {
      Authorization: "Bearer " + getToken(),
    };
    axios(config)
      .then((res) => {
        if (res.data.type !== "application/json") {
          // combine file's name
          const contentDispositionArr =
            res.headers["content-disposition"].split(";");
          const contentDispositionObj: any = {};
          contentDispositionArr.forEach((item: any) => {
            const index = item.indexOf("=");
            if (index > -1) {
              contentDispositionObj[item.substring(0, index)] = item.substring(
                index + 1,
                item.length
              );
            }
          });
          console.log(res);
          const link = document.createElement("a");
          link.href = URL.createObjectURL(res.data);
          link.download = decodeURIComponent(contentDispositionObj.filename);
          link.click();
          resolve(link);
        } else {
          ElMessage.error("下载失败！");
          reject(new Error("下载失败！"));
        }
      })
      .catch((error) => {
        if (error.response) {
          // 将blob转为json 解析后端返回的错误信息
          const response = error.response;
          const reader: any = new FileReader();
          let parseObj = null;
          reader.readAsText(response.data, "utf-8");
          reader.onload = function () {
            parseObj = JSON.parse(reader.result);
            ElMessage.error(parseObj.errorMsg || "下载失败！");
          };
        } else {
          ElMessage.error("下载失败！");
        }
        reject(error);
      });
  });
};

export const downloadPromiseByExcel = <T>(config: AxiosRequestConfig<T>) => {
  config.url = "/api" + config.url;
  config = {
    headers: {},
    ...config,
  };
  config.headers = {
    "content-type": "application/vnd.ms-excel;charset=UTF-8",
  };
  return downloadPromise(config);
};

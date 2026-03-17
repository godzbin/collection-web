// export const beianhao = "guoruixinneng.com 粤ICP备2022118025号-2";

export const tokenLocalName = "token";
export const userInfoLocalName = "userInfo";
export const getToken = (): string => {
    return localStorage.getItem(tokenLocalName) || "";
};

export const setToken = (token: string) => {
    localStorage.setItem(tokenLocalName, token);
};


export const removeLocalInfo = () => {
    localStorage.removeItem(tokenLocalName);
    localStorage.removeItem(userInfoLocalName);
};




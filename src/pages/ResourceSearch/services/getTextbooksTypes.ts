export interface Request {
    stage?: string;
    subject?: string;
    [property: string]: any;
}

export interface Response {
    code: number;
    data: Datum[];
    msg: string;
    status: string;
    [property: string]: any;
}

export interface Datum {
    /**
     * 年级
     */
    grade: string;
    /**
     * 教材id，用这个传值
     */
    id: string;
    /**
     * 册别
     */
    name: string;
    /**
     * 这个目前用不上
     */
    sortNo: number;
    /**
     * 学段
     */
    stage: string;
    /**
     * 学科
     */
    subject: string;
    /**
     * 版本
     */
    version: string;
    [property: string]: any;
}
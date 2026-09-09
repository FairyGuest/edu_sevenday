export interface Request {
    book_id?: string;
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
     * 节
     */
    children: DatumChild[];
    /**
     * 题目编码，传参用这个
     */
    code: string;
    /**
     * id
     */
    id: string;
    level: number;
    /**
     * 名称
     */
    name: string;
    parentCode: null;
    sortNo: number;
    [property: string]: any;
}

export interface DatumChild {
    children: ChildChild[];
    code: string;
    id: string;
    level: number;
    name: string;
    parentCode: string;
    sortNo: number;
    [property: string]: any;
}

export interface ChildChild {
    children: string[];
    code: string;
    id: string;
    level: number;
    name: string;
    parentCode: string;
    sortNo: number;
    [property: string]: any;
}
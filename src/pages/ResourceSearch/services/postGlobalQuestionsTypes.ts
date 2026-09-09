export interface Request {
    catalogue_list: string[];
    difficulties: string[];
    grade: string;
    keyword: string;
    /**
     * 知识点列表
     */
    kg_list: string[];
    current: number;
    size: number;
    /**
     * 地区
     */
    province: string[];
    question_type: string[];
    /**
     * 场景
     */
    scene: string[];
    stage: string;
    subject: string;
    use_type: string[];
    year: number[];
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
    answerList: string[];
    quesAnalysis: string[];
    area: string;
    chapters: Chapter[];
    childrenCount: number;
    publicQuestionList: Datum[];
    createTime: string;
    difficulty: string;
    grade: string;
    hasChild: boolean;
    id: string;
    /**
     * 是否收藏
     */
    is_favorite: boolean;
    kgPointList: KgPoint[];
    options: string[] | null;
    quesAudio: null;
    quesType: string;
    quesVideo: null;
    /**
     * 场景
     */
    scene: string;
    stage: string;
    stem: string;
    subject: string;
    timestamp: string;
    updateTime: string;
    year: number;
    [property: string]: any;
}

export interface Chapter {
    code: string;
    id: string;
    name: string;
    [property: string]: any;
}

export interface KgPoint {
    code: string;
    id: string;
    name: string;
    [property: string]: any;
}
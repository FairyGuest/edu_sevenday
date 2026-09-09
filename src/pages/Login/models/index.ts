import { message } from "antd";
import * as services from "../services";

export default {
  namespace: "loginModel",
  state: {
    showCollection: false,
    doneChallenge: false,
  },

  reducers: {
    updateState(state: any, { res }: any) {
      // 更新state
      return {
        ...state,
        ...res,
      };
    },
  },

  effects: {
        // // post数据
        // *postData(params: any, { call, put, select }) {
        //   const { payload, mTitle, mLoading, isInfo, apiUrl, contentType } = params
        //   const loading = mLoading || "loading"
        //   yield put({ type: "updateState", res: { [loading]: true, [mTitle]: null } });
        //   const result = yield call(services.postDataService, payload, apiUrl, contentType);
        //   if (result && mTitle) {
        //     yield put({ type: "updateState", res: { [mTitle]: result.data } });
        //   }
        //   yield put({ type: "updateState", res: { [loading]: false } });
        //   if (isInfo && result.code == 200) { // 成功提示
        //     message.success(result.msg);
        //   }
          
        //   // if (result.code == 500) { // 后端提示
        //   //   message.error(result.msg);
        //   // }
    
        //   return result;
        // },
          // 更新 modal 数据
  *setData({ mTitle, payload }, { call, put, select }) {
    if (mTitle) {
      const currentState = yield select((state: any) => state.designModel);
      const tmp = { ...currentState[mTitle], ...payload }
      yield put({ type: "updateState", res: { [mTitle]: tmp } });
    } else {
      yield put({ type: "updateState", res: { ...payload } });
    }

  },

    // post数据
    *postData(params: any, { call, put, select }) {
      const { payload, mTitle, mLoading, isInfo, apiUrl, headers } = params
      const loading = mLoading || "loading"
      yield put({ type: "updateState", res: { [loading]: true, [mTitle]: null } });
      const result = yield call(services.postDataService, payload, apiUrl, { headers });
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      if (isInfo && result.code == 200) { // 成功提示
        message.success(result.msg);
      }
      return result;
    },

    // 设置教师上下文
    *setTeacherContext({ payload }, { call, put, select }) {
      const result = yield call(services.postDataService, payload, "setTeacherContextUrl");
      if (result?.code === 200 && result?.data) {
        // save 接口可能不回传 academic_year_list，整份覆盖会导致学年状态丢失、历史学年按钮误显
        const prev = yield select((state: any) => state.commonModel?.teacherContext);
        const nextData = result.data;
        const academicYearList =
          Array.isArray(nextData?.academic_year_list) && nextData.academic_year_list.length > 0
            ? nextData.academic_year_list
            : prev?.academic_year_list;
        yield put({
          type: "updateState",
          res: {
            teacherContext: {
              ...prev,
              ...nextData,
              academic_year_list: academicYearList,
            },
          },
        });
      }
      return result;
    },

    // get请求
    *getData({ payload, mTitle, mLoading, apiUrl }: any, { call, put, select }: any): Generator<any, any, any> {
      const loading = mLoading || "loading";
      yield put({ type: "updateState", res: { [loading]: true } });
      const result = yield call(services.getDataService, payload, apiUrl);
      if (result && mTitle) {
        yield put({ type: "updateState", res: { [mTitle]: result.data } });
      }
      yield put({ type: "updateState", res: { [loading]: false } });
      return result;
    },
    
  },
};

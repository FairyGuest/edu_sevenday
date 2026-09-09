import { message } from "antd";
import { useDispatch, useSelector } from "umi";
const useQuestionActions = () => {
    const dispatch = useDispatch();
    useSelector((state: any) => state.teachDesginModel);

    const toggleQuestionFavorite = async (planId: string,type: string) => {
        const { code, data }: any = await dispatch({
            type: "teachDesginModel/postData",
            apiUrl: "postDownloadPaln",
            payload: {
                plan_id: planId,
                download_type:type,
                download_suffix: "docx",
            },
        });
        if (code === 200) {
            const url = `https://view.officeapps.live.com/op/view.aspx?src=${data?.file_url}`
            window.open(url, "_blank");
        }
    };

    return {
        toggleQuestionFavorite,
    };
};
export default useQuestionActions;

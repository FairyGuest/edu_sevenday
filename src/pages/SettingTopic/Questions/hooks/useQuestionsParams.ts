import { useLocation } from "@umijs/max";
import { useTeacherContext } from "@/components/LayoutSider";
import { resolveIsPaperCompose, resolvePaperId } from "../constants";

export const useQuestionsParams = () => {
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [context, contextLoading] = useTeacherContext();
  const courseId = context?.course_id;

  const paperId = resolvePaperId(searchParams);
  const setType = searchParams.get("setType");
  const homeworkType = searchParams.get("homeworkType");
  const status = searchParams.get("status");
  const isPaperCompose = resolveIsPaperCompose(pathname, searchParams);

  return {
    courseId,
    contextLoading,
    paperId,
    setType,
    homeworkType,
    status,
    isPaperCompose,
    pathname,
    search,
    searchParams,
  };
};

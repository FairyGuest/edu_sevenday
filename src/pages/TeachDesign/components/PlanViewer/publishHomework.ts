export async function publishPlanHomework(classId: string, chapter: string) {
  let response: Response;
  try {
    response = await fetch("/api/teacher/teaching/assign-homework", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "plan", chapter, class_id: classId }),
    });
  } catch {
    throw new Error("网络异常，暂未确认发布结果，请先到「作业下发」核对后再重试");
  }
  const result = await response.json();
  if (!response.ok || result.code !== 200 || !result.data?.homework_id) {
    throw new Error(result.msg || "发布失败，请重试");
  }
  return result.data;
}

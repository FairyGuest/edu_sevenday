/** 页面离开兜底保存：同一轮离开只执行一次，避免多入口重复调接口且数据不一致 */
let leaveSaveLocked = false;

export const tryAcquireLeaveSaveLock = () => {
  if (leaveSaveLocked) return false;
  leaveSaveLocked = true;
  return true;
};

export const resetLeaveSaveLock = () => {
  leaveSaveLocked = false;
};

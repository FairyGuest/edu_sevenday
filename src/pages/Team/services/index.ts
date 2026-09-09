import { postDataRequest, getDataRequest } from "@/utils";
import { cogUrl } from "@/utils/host";

const api: any = {


  // getOrgUrl: `${cogUrl}/org/get`, //获取组织信息
  // updOrgUrl: `${cogUrl}/org/upd`, // 修改组织信息


  // addUsersUrl: `${cogUrl}/org/user/batch/add`, // 空间用户批量手机号添加
  // delUsersUrl: `${cogUrl}/org/user/batch/del`, // 空间用户批量删除
  // userListUrl: `${cogUrl}/org/user/list`, // 组织用户列表(无分页)
  // addUserUrl: `${cogUrl}/org/user/add`, // 组织用户添加
  // updDelUrl: `${cogUrl}/org/user/upd`, // 组织用户更新
  // delUserUrl: `${cogUrl}/org/user/del`, // 组织用户删除


  // addUsers: `${cogUrl}/org/user/add`, // 空间用户手机号添加
  // updateUsers: `${cogUrl}/org/user/update`, // 空间用户手机号编辑
  // userListPagination: `${cogUrl}/org/user/list2`, // 组织用户列表(有分页)
  // facultyList: `${cogUrl}/org/faculty/list`, // 院系列表
  // majorList: `${cogUrl}/org/major/list`, // 专业列表
  // postList: `${cogUrl}/org/post/list`, // 岗位列表
  // delUser: `${cogUrl}/org/user/logic/delete/:id`, // 组织用户删除
  // delUserNew: `${cogUrl}/org/user/logic/delete`, // 组织用户删除

  // usersGroupIn: `${cogUrl}/org/group/in`, // 当前登录用户是否在某个班级

  // groupInfo : `${cogUrl}/org/group/info `, // 组织详情

  classInfo: `${cogUrl}/web/user/teacher/findStudentList`, // 班级详情
  getremoveStudent: `${cogUrl}/web/user/teacher/removeStudent`, // 移除学生
  postaddStudentUrl: `${cogUrl}/web/user/teacher/createStudent`, // 添加学生
  postupdateStudentUrl:`${cogUrl}/web/user/teacher/updateStudent`, // 更新学生密码
  postcreateTeacherUrl: `${cogUrl}/web/user/teacher/getStudent`, // 学生详情
  



  // // 部门
  // addDepartmentUrl: `${cogUrl}/org/department/add`, // 部门添加
  // updDepartmentUrl: `${cogUrl}/org/department/upd`, // 部门更新
  // delDepartmentUrl: `${cogUrl}/org/department/del`, // 部门删除
  // departmentListUrl: `${cogUrl}/org/department/list`, // 部门列表

  // getDepartmentUrl: `${cogUrl}/org/department/user/list`, // 获取部门用户
  // addDepartUserUrl: `${cogUrl}/org/department/user/batch/add`, // 添加部门用户
  // updDepartUserUrl: `${cogUrl}/org/department/user/upd`, // 修改部门用户
  // delDepartUserUrl: `${cogUrl}/org/department/user/batch/del`, // 删除部门用户



  // // 群组

  // addGroupUrl: `${cogUrl}/org/group/add`, // 群组添加
  // updGroupUrl: `${cogUrl}/org/group/upd`, // 群组更新
  // delGroupUrl: `${cogUrl}/org/group/del`, // 群组删除
  // groupListUrl: `${cogUrl}/org/group/list`, // 群组列表

  // getGroupUserUrl: `${cogUrl}/org/group/user/list`, // 获取群组用户
  // getClassUserUrl: `${cogUrl}/zhuguan/class_users`, // 获取班级用户(助管)
  // addGroupUserUrl: `${cogUrl}/org/group/user/batch/add`, // 添加群组用户
  // updGroupUserUrl: `${cogUrl}/org/group/user/upd`, // 修改群组用户
  // delGroupUserUrl: `${cogUrl}/org/group/user/batch/del`, // 删除群组用户


  // getGroupStudentUrl: `${cogUrl}/org/group/sub/list`, // 小组列表 
  // delGroupStudentUrl: `${cogUrl}/org/group/sub/del`, // 删除小组 

  // // getStudentListUrl:`${cogUrl}/org/group/student/list`, // 获取小组学生列表
  // getStudentListUrl:`${cogUrl}/zhuguan/group_student_list`, // 获取小组学生列表
  // addStudentGroupUrl:`${cogUrl}/org/group/sub/add`, // 创建小组
  // updStudentGroupUrl:`${cogUrl}/org/group/sub/upd`, // 修改小组


};



export async function postDataService(params: any, apiUrl: string) {
  return postDataRequest(params, api[apiUrl]);
}

export async function getDataService(params: any, apiUrl: keyof typeof api) {
  return getDataRequest(params, api[apiUrl]);
}

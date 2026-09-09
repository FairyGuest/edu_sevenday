import {Redirect} from 'umi';
import {connect} from 'dva';

// 控制权限
const Auth = (props: any) => {
  const {route} = props;
  // 获取用户菜单
  let authMenu = JSON.parse(localStorage.getItem('SIGN_MENU'));
  const {path} = route;
  if (authMenu && authMenu[path]) {
    return <div>{props.children}</div>;
  } else {
    // 展示销售推荐
    return <Redirect to='/403'/>;
  }
};

export default connect((state: any) => ({
  commonModel: state.commonModel,
}))(Auth);

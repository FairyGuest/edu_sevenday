import { useRef, useState, useEffect } from 'react';
import type { TourProps } from 'antd';
import { siderTourSteps, shouldShowTour, siderTourStepstow } from './config';
import { useDispatch } from "umi";

export const useSiderTour = (): any => {
  const local = localStorage.getItem("userInfo") || "{}";
  const shopInfo = JSON.parse(local);


  const dispatch = useDispatch();
  const [tourOpen, setTourOpen] = useState(shopInfo?.show_guide || true);

  const homeMenuRef = useRef<any>(null);
  const teachMenuRef = useRef<any>(null);
  const agentMenuRef = useRef<any>(null);
  const hometowRef = useRef<any>(null);
  const homeMenutowRef = useRef<any>(null);


  homeMenuRef.current = document.querySelector('.homeMenuRef:nth-child(1)');
  teachMenuRef.current = document.querySelector('.teachMenuRef:nth-child(2)');
  agentMenuRef.current = document.querySelector('.agentMenuRef');
  hometowRef.current = document.querySelector('.create_course_btn');
  homeMenutowRef.current = document.querySelector('#create_course_btn');

  const getTourhome = () => {
      return shopInfo?.has_course ? siderTourStepstow(hometowRef.current) : siderTourStepstow(homeMenutowRef.current)
  };

  const getTourSteps = () => {
    return siderTourSteps(
      homeMenuRef.current,
      teachMenuRef.current,
      agentMenuRef.current
    );
  };

  const startTour = () => {
    setTourOpen(true);
    // localStorage.setItem('siderTourShown', 'true');
  };
  const closeTour = async () => {
    setTourOpen(false);
    try {
      const response: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "postuseSiderTour",
        payload: {
          step: 1,
        }
      });
      const { code, data } = response;
      console.log('请求返回:', code, data);
      if (code === 200) {
        const newUserInfo = { ...shopInfo, guide_step:1 };
        localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
      }
    } catch (error) {
      console.log('关闭引导请求失败:', error);
    }
  };

  const oncloseTour=async()=>{
     setTourOpen(false);
    try {
      const response: any = await dispatch({
        type: "setQuestionsModel/postData",
        apiUrl: "postuseSiderTour",
        payload: {
          step: 2,
        }
      });
      const { code, data } = response;
      console.log('请求返回:', code, data);
      if (code === 200) {
        const newUserInfo = { ...shopInfo, show_guide: false, guide_step:2 };
        localStorage.setItem("userInfo", JSON.stringify(newUserInfo));
      }
    } catch (error) {
      console.log('关闭引导请求失败:', error);
    }
  }

  useEffect(() => {
    const cRouter = window.location.pathname;
    const excludeRoute = ["/login", "/register", "/create", "/answerQuestions", "/third"];
    if (shouldShowTour() && !excludeRoute.some(route => cRouter.includes(route))) {
      const timer = setTimeout(() => {
        startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    tourOpen,
    setTourOpen,
    getTourSteps,
    startTour,
    closeTour,
    oncloseTour,
    getTourhome,
  };
};

export default useSiderTour;
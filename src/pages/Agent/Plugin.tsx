import { useEffect, useRef, useState } from "react";
import Qingliu from "./components/Qingliu";

import "./index.less";


const Chat = (props: any) => {
  return <Qingliu url={'/basic-edu-flow/plugin'} />
};

export default Chat;

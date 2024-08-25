import React from 'react';

import { Input } from "@/components/ui/input";

import styles from './login.module.css';

const Login = () => {
  return (
    <div className="flex justify-center">
      <div className="h-[698px] w-[1152px] flex justify-center items-center gap-[100px] bg-white rounded-[15px] mt-[50px] mb-[60px]">
        <div className={`w-[490px] h-[644px] rounded-[50px] ${styles.gradation}`}></div> 
        <div className="flex flex-col justify-center items-center mb-[45px] mr-[100px] ml-[30px]">           
          <h3 className="text-[35px] font-[600] mb-[30px]">Login</h3>
          <div className="flex flex-col gap-[30px]">
            <div><Input name="id" placeholder="ID" className="rounded-[50px] w-[330px] h-[50px]"/></div>
            <div><Input name="password" placeholder="PW" className="rounded-[50px] w-[330px] h-[50px]"/></div>
            <button style={{backgroundColor:"rgba(71, 68, 138, 1)"}} className="rounded-[50px] h-[50px] text-white font-semibold text-[20px]">로그인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

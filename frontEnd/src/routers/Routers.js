import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UploadData from "../uploadData";
const Routers = () => {
  return (
    <div>
      <Routes>
        <Route path="/UploadData" element={<UploadData />} />
    
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default Routers;



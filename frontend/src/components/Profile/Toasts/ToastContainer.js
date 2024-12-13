import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContainer = () => (
  <ReactToastifyContainer position="top-right" autoClose={3000} />
);

export default ToastContainer;

import axios from 'axios';
import { USER_LOGIN_SUCCESS, USER_LOGIN_FAIL, USER_LOGOUT } from '../constants/authConstants';  // Make sure you're importing correctly

// Login Action
export const login = (email, password) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post('/api/users/login', { email, password }, config);

    dispatch({
      type: USER_LOGIN_SUCCESS,  // Using consistent constant names
      payload: data,  // The full user data, including token, will be saved
    });

    // Store userInfo in localStorage to persist the login
    localStorage.setItem('userInfo', JSON.stringify(data));
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,  // Consistent naming
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Logout Action
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');  // Remove userInfo from localStorage
  dispatch({ type: USER_LOGOUT });  // Use USER_LOGOUT constant
};

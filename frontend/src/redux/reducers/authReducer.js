// reducers/authReducer.js

import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from '../constants/authConstants';

const initialState = {
  isAuthenticated: false,
  token: null,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload,
        error: null,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        error: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        error: null,
      };
    default:
      return state;
  }
};

export default authReducer;

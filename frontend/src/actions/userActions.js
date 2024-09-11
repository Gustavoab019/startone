import axios from 'axios';

// Example action for login
export const login = (email, password) => async (dispatch) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post('/api/users/login', { email, password }, config);

    dispatch({
      type: 'USER_LOGIN_SUCCESS',
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: 'USER_LOGIN_FAIL',
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

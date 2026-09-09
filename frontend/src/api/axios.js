import axios from 'axios';


const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  withCredentials: true,

});



let accessToken = null;


export const setAccessToken = (token) => {

  accessToken = token;

};


export const clearAccessToken = () => {

  accessToken = null;

};



api.interceptors.request.use((config) => {

  if (accessToken) {

    config.headers.Authorization = `Bearer ${accessToken}`;

  }

  return config;

});


let isRefreshing = false;

let failedQueue = [];


const processQueue = (error, token = null) => {

  failedQueue.forEach(prom => {

    if (error) {

      prom.reject(error);

    } else {

      prom.resolve(token);

    }

  });

  failedQueue = [];

};



api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;


    if (

      error.response?.status === 401 &&

      !originalRequest._retry &&

      !originalRequest.url.includes('/auth/login') &&

      !originalRequest.url.includes('/auth/refresh-token')

    ) {


    

      if (isRefreshing) {

        return new Promise(function(resolve, reject) {

          failedQueue.push({
            resolve,
            reject
          });

        })

        .then(token => {

          originalRequest.headers.Authorization =
            'Bearer ' + token;

          return api(originalRequest);

        })

        .catch(err => {

          return Promise.reject(err);

        });

      }


      originalRequest._retry = true;

      isRefreshing = true;


      try {

        const res = await axios.post(

          `${api.defaults.baseURL}/auth/refresh-token`,

          {},

          {
            withCredentials: true
          }

        );

        const newToken =
          res.data?.data?.accessToken;


        if (newToken) {

       
          setAccessToken(newToken);


          originalRequest.headers.Authorization =
            `Bearer ${newToken}`;
    
          processQueue(null, newToken);

          return api(originalRequest);

        }

      } catch (refreshError) {
  
        processQueue(refreshError, null);

        clearAccessToken();

        window.dispatchEvent(
          new Event('auth:unauthorized')
        );

        return Promise.reject(refreshError);

      } finally {

        isRefreshing = false;

      }
    }

    return Promise.reject(error);

  }

);


export default api;
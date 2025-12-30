import axios from "axios";

const api = axios.create({
  // baseURL:"http://13.200.174.224:83",
  baseURL:"https://epressnoteapi.testenvapp.com",

  withCredentials: false,
});

export default api;

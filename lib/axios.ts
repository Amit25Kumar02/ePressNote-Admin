import axios from "axios";

const api = axios.create({
  baseURL:"https://epressnoteapi.testenvapp.com",
  withCredentials: false,
});

export default api;

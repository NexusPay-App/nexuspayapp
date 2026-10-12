import apiClient from '../lib/api';
// All callers share environment and authentication handling.
const useAxios = () => apiClient;
export default useAxios;

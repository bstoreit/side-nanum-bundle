import axios from 'axios';

// API 기본 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/prod';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // CORS 우회 옵션 추가
  withCredentials: false,
  mode: 'cors',
});

// 요청 인터셉터 - 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 로그인 API가 아닌 경우에만 리다이렉트
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 로그인
  login: async (businessNumber, password) => {
    try {
      const response = await api.post('/login', {
        businessNumber,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      // 서버 응답을 그대로 반환하여 LoginPage에서 처리할 수 있도록 함
      return {
        ok: false,
        message: error.response?.data?.message || '로그인에 실패했습니다.'
      };
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // 토큰 검증
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw new Error('토큰 검증에 실패했습니다.');
    }
  },
};

// 사업 관련 API
export const businessAPI = {
  // 사업 목록 조회
  getBusinesses: async () => {
    try {
      const response = await api.get('/businesses');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '사업 목록을 불러오는데 실패했습니다.');
    }
  },

  // 사업 상세 조회
  getBusiness: async (businessId) => {
    try {
      const response = await api.get(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '사업 정보를 불러오는데 실패했습니다.');
    }
  },

  // 사업 생성
  createBusiness: async (businessData) => {
    try {
      const response = await api.post('/businesses', businessData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '사업 생성에 실패했습니다.');
    }
  },

  // 사업 수정
  updateBusiness: async (businessId, businessData) => {
    try {
      const response = await api.put(`/businesses/${businessId}`, businessData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '사업 수정에 실패했습니다.');
    }
  },

  // 사업 삭제
  deleteBusiness: async (businessId) => {
    try {
      const response = await api.delete(`/businesses/${businessId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '사업 삭제에 실패했습니다.');
    }
  },
};

// 대상자 관련 API
export const targetAPI = {
  // 대상자 목록 조회
  getTargets: async (businessId) => {
    try {
      const response = await api.get(`/businesses/${businessId}/targets`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 목록을 불러오는데 실패했습니다.');
    }
  },

  // 대상자 상세 조회
  getTarget: async (businessId, targetId) => {
    try {
      const response = await api.get(`/businesses/${businessId}/targets/${targetId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 정보를 불러오는데 실패했습니다.');
    }
  },

  // 대상자 생성
  createTarget: async (businessId, targetData) => {
    try {
      const response = await api.post(`/businesses/${businessId}/targets`, targetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 생성에 실패했습니다.');
    }
  },

  // 대상자 수정
  updateTarget: async (businessId, targetId, targetData) => {
    try {
      const response = await api.put(`/businesses/${businessId}/targets/${targetId}`, targetData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 수정에 실패했습니다.');
    }
  },

  // 대상자 삭제
  deleteTarget: async (businessId, targetId) => {
    try {
      const response = await api.delete(`/businesses/${businessId}/targets/${targetId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 삭제에 실패했습니다.');
    }
  },

  // 대상자 검색
  searchTargets: async (businessId, searchTerm) => {
    try {
      const response = await api.get(`/businesses/${businessId}/targets/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || '대상자 검색에 실패했습니다.');
    }
  },
};

export default api;

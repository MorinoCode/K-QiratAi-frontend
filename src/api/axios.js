import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // برای ارسال کوکی‌ها
    headers: {
        'Content-Type': 'application/json'
    }
});

// ✅ Interceptor: افزودن خودکار Tenant ID به تمام درخواست‌ها
instance.interceptors.request.use(
    (config) => {
        // خواندن شناسه فروشگاه که در زمان لاگین ذخیره کردیم
        const tenantId = localStorage.getItem('tenant_id');
        
        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
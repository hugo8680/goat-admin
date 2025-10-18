import {mergeConfig} from 'vite';
import baseConfig from './vite.config.base';

export default mergeConfig(
    {
        mode: 'development',
        server: {
            // 是否自动在浏览器打开
            open: true,
            // 端口
            port: 1024,
            // 是否开启 https
            https: false,
            fs: {
                strict: true,
            },
            // 设置反向代理，跨域
            proxy: {
                '/api': {
                    target: `http://localhost:3000`,
                    changeOrigin: true,
                    secure: false, // 如果是https接口，需要配置这个参数
                    rewrite: (p) => p.replace(/^\/api/, '/api')
                }
            },
        },
        plugins: [
        ],
    },
    baseConfig
);

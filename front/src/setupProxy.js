const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  	app.use(
    	'/api',									// '/api'로 시작하는 모든 요청은 이 미들웨어를 거침
    	createProxyMiddleware({
      		target: 'http://localhost:3001',	// 서버의 포트를 작성
      		changeOrigin: true,					// 요청 헤더의 호스트 헤더를 대상 서버의 URL로 변경 
    	})
  	);
}
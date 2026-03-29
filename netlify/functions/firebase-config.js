// Firebase 설정을 환경변수에서 안전하게 노출
exports.handler = async () => {
  const config = {
    apiKey:      process.env.FIREBASE_API_KEY      || '',
    authDomain:  process.env.FIREBASE_AUTH_DOMAIN  || '',
    projectId:   process.env.FIREBASE_PROJECT_ID   || '',
  };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(config),
  };
};

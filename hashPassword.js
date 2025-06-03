const bcrypt = require('bcrypt');

const textToHash = async (text) => {
  const saltRounds = 10;
  try {
    const hash = await bcrypt.hash(text, saltRounds);
    return hash;
  } catch (err) {
    console.error(err);
    return null;
  }
};

(async () => {
  const password = 'securePassword123';  // 비밀번호 입력
  const hash = await textToHash(password);
  console.log('Hashed password:', hash);
})();

import bcrypt from 'bcrypt';

const hashPassword = async (password) => {
    const saltRounds = 10; // Количество раундов соли
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Хеш пароля:', hashedPassword);
};

// Замените 'your_password_here' на пароль, который нужно хешировать
hashPassword('mirek_admin');

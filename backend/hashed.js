import bcrypt from "bcryptjs";

async function hashPassword() {
    const password = "0123456";

    // Generate salt and hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Plain Password:", password);
    console.log("Hashed Password:", hashedPassword);
}

hashPassword();

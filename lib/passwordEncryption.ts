import bcrypt from "bcryptjs";

// Function to hash a password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10); // Salt rounds for security
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Function to compare a password with a hashed password
export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

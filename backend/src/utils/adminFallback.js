import bcrypt from "bcryptjs";

const fallbackAdmin = {
  name: "Sumit Panchal",
  email: "sumitpanchal2552@gmail.com",
  passwordHash: bcrypt.hashSync("Sumit@2552", 12),
  role: "admin",
  profilePic: "/image/profile.jpg",
  id: "000000000000000000000001",
  tokenVersion: 0,
};

export const validateFallbackAdminLogin = async (email, password) => {
  if (!email || email.trim().toLowerCase() !== fallbackAdmin.email) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, fallbackAdmin.passwordHash);
  if (!isMatch) {
    return null;
  }

  return {
    _id: fallbackAdmin.id,
    name: fallbackAdmin.name,
    email: fallbackAdmin.email,
    role: fallbackAdmin.role,
    profilePic: fallbackAdmin.profilePic,
    tokenVersion: fallbackAdmin.tokenVersion,
  };
};

export const getFallbackAdmin = () => ({
  _id: fallbackAdmin.id,
  name: fallbackAdmin.name,
  email: fallbackAdmin.email,
  role: fallbackAdmin.role,
  profilePic: fallbackAdmin.profilePic,
  tokenVersion: fallbackAdmin.tokenVersion,
});

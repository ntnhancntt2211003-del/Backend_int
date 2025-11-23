import User from "../models/user.model.js";

export const CheckUserExist = async (numberPhone, email) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ numberPhone }, { email }],
    });
    if (existingUser) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    throw new Error("Error checking user existence: " + error.message);
  }
};

export const CreateUserNew = async (
  username,
  email,
  password,
  avatar,
  numberPhone
) => {
  try {
    if (!email || !username || !password || !numberPhone) {
      throw new Error("Missing required fields");
    } else {
      const newUser = new User({
        username,
        email,
        password,
        numberPhone,
        ...(avatar ? { avatar } : {}),
      });
      await newUser.save();
      return newUser;
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error creating user: " + error.message);
  }
};

export const GetInforUser = async (id) => {
  try {
    const user = await User.findById(id).select("-password");
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching user information: " + error.message);
  }
};

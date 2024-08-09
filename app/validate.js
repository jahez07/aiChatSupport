export const checkValidData = (email, password, fullname) => {
  const isEmailValid = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(
    email
  );
  const isPasswordValid = /^[A-Za-z0-9!@#$%^&*()_+]{8,20}$/.test(password);
  const isFullNameValid = /^[A-Za-z\-\'\s]+$/.test(fullname);

  if (!isEmailValid) return "Email ID is not valid";
  if (!isPasswordValid) return "Password is not valid";
  if (!isFullNameValid) return "Full Name is not valid";
  return null;
};

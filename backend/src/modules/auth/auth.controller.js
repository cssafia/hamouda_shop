const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/apiResponse');
const authService = require('./auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return success(res, result, 'Logged in');
});

const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client drops the token.
  return success(res, null, 'Logged out');
});

const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  await authService.changePassword(req.user.id, current_password, new_password);
  return success(res, null, 'Password updated');
});

const forgetPassword = asyncHandler(async (req, res) => {
  await authService.forgetPassword(req.body.email);
  return success(res, null, 'If the email exists, a reset link has been sent');
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, new_password } = req.body;
  await authService.resetPassword(token, new_password);
  return success(res, null, 'Password has been reset');
});

module.exports = { login, logout, changePassword, forgetPassword, resetPassword };
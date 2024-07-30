// const catchAsync = (fn, message = err.message, statusCode = 500) => {
//     return (req, res, next) => {
//       fn(req, res, next).catch(error => {
//         error.statusCode = statusCode;
//         error.message = message;
//         next(err);
//       });
//     };
//   };



const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (error) {
    // console.log("Hello")
    // console.log(error.message)
    return res.status(error.code || 500).json({
      success: false,
      message: error.message
    });
  }

}
module.exports = asyncHandler;
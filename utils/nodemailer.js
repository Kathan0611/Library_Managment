const nodemailer= require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adalajakathan06@gmail.com",
    pass: "xmck kvgv unsz vccw",
  },
});

exports.sendOtpMail = async (email,otp) => {
  try {
    const mailOptions = {
      form: "adalajakathan06@gmail.com",
      to: email,
      subject: "Password reset OTP",
      text: `Your OTP (It is expired after 1 min) : ${otp} don't share your OTP to anyone! `,
      html: `
    <p>Your OTP (It expires after 1 minute): <strong>${otp}</strong>. Don't share your OTP with anyone!</p>
    <p>Click <a href="https://ic-stations-insider-samba.trycloudflare.com/userRouter/resetPassword?token=${otp}">here</a> to reset your password.</p>
  `
      
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error", error);
      } else {
        console.log("Success", info.response);
      }
    });
  } catch (err) {
      console.log(err.message)
  }
};
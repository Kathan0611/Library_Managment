const express=require('express');
const router= express.Router();
const userController=require('../controllers/userController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');
const authMiddleware=require('./../middleware/authMiddleware');
const {checkRole}=require('../middleware/checkRoleMiddleware')

// console.log(typeof(userController.signup))

router.post('/signup',validate(validateSchema.registerSchema), userController.signup);
router.post('/login',validate(validateSchema.loginSchema),userController.login);
router.post('/refresh',validate(validateSchema.refreshSchema),userController.refresh)
router.get('/singleUser/:id',authMiddleware,userController.singleUser); 
router.get('/getAlluser',authMiddleware,checkRole(['admin','user']),userController.getAllUser);
router.put('/updateProfile',upload.single('BannerImage'),authMiddleware,checkRole(['admin','user']),userController.updateUser);
router.delete('/deleteUser/:id',authMiddleware,userController.deleteUser);     
router.post('/logout',authMiddleware,userController.logout);
router.post('/forgotPassword',validate(validateSchema.forgotpassword),userController.forgotPassword);  
router.post('/resetPassword',validate(validateSchema.resetPassword),userController.resetPassword);
router.post('/changePassword',validate(validateSchema.newpassword),userController.changePassword); 
router.post('/verify',validate(validateSchema.verifyOtp),userController.verify);
                 
       
module.exports=router;      

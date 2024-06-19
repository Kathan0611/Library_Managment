const express=require('express');
const router= express.Router();
const userController=require('./../controllers/userController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');

router.post('/signup' ,upload.fields([{ name: 'Image',maxCount:5}, { name: 'BannerImage',maxCount:1}])
, validate(validateSchema.registerSchema),userController.signup);
router.post('/login',validate(validateSchema.loginSchema),userController.login);
router.get('/singleUser',userController.singleUser);
router.get('/getAlluser',userController.getAllUser);
router.put('/updateUser',userController.updateUser);
router.delete('/deleteUser/:id',userController.deleteUser);


module.exports=router;

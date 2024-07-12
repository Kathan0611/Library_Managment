const express=require('express');
const router= express.Router();
const categoryController=require('./../controllers/CategoryController');
const upload=require('./../utils/multer');
const validateSchema=require('./../utils/validateSchema');
const validate=require('./../middleware/validationMiddleware');

router.post('/createOne',validate(validateSchema.categoryName),categoryController.createCategory);
router.get('/getAll',categoryController.getAllCategories);
router.get('/getOne/:id',categoryController.singleCategory);
router.put('/updateOne/:id',categoryController.updateCategory)
router.delete('/deleteOne/:id',categoryController.deleteCategory);
router.delete('/deleteAll',categoryController.destroyAllCategory);



module.exports=router;

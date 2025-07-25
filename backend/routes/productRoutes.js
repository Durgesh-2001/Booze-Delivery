import express from "express";
import { addProduct, listProducts, removeProduct, getProduct, updateProduct } from "../controllers/productController.js";
import multer from "multer";
import Product from "../models/productModel.js";

const router = express.Router();

// Image storage engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (_req, file, cb) => {
        return cb(null, `product_${Date.now()}${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post("/add", upload.single("image"), addProduct);
router.get("/list", listProducts);
router.post("/remove", removeProduct);
router.put("/edit/:id", upload.single("image"), updateProduct);
router.get("/:id", getProduct);

// Count route for dashboard
router.get("/count", async (_req, res) => {
    try {
        const count = await Product.countDocuments();
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to get product count" 
        });
    }
});

export default router;

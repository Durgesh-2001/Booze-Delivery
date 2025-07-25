import Product from "../models/productModel.js";
import fs from "fs";

const ensureUploadsDir = () => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
};

const safeDeleteFile = (filepath) => {
    try {
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            return true;
        }
        return false;
    } catch (error) {
        console.log('File deletion error:', error);
        return false;
    }
};

const addProduct = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        image: image_filename,
        description: req.body.description,
        inStock: req.body.inStock === 'true'
    });

    try {
        const savedProduct = await product.save();
        res.status(200).json({
            success: true,
            message: "Product added successfully",
            data: savedProduct
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const listProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, data: products });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Products not found" });
    }
}

const removeProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.body.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        ensureUploadsDir();
        const imagePath = `uploads/${product.image}`;
        const imageDeleted = safeDeleteFile(imagePath);

        const result = await Product.deleteOne({ _id: req.body.id });

        if (result.deletedCount === 1) {
            return res.status(200).json({
                success: true,
                message: "Product removed successfully",
                imageDeleted
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Failed to delete product"
            });
        }
    } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({
            success: false,
            message: "Server error while removing product",
            error: error.message
        });
    }
}

const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching product"
        });
    }
}

const updateProduct = async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            category: req.body.category,
            description: req.body.description,
            inStock: req.body.inStock === 'true'
        };

        if (req.file) {
            const oldProduct = await Product.findById(req.params.id);
            if (oldProduct && oldProduct.image) {
                try {
                    fs.unlinkSync(`uploads/${oldProduct.image}`);
                } catch (error) {
                    console.log('Error deleting old image:', error);
                }
            }
            updateData.image = req.file.filename;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating product",
            error: error.message
        });
    }
}

export { addProduct, listProducts, removeProduct, getProduct, updateProduct };

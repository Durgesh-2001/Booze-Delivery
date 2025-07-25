import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Beer', 'Wine']
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    size: {
        type: String,
        default: '750ml'
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
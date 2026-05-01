import cloudinary from "../utils/cloudinaryConfig.js";
import { CreateCatalogSchema } from "../middlewares/validator.js"
import Catalog from "../models/catalog.js"

const catalogGreeting = async (req, res) => {
    res.send("Welcome to the Catalog Routes");
}

// const getAllCatalogCatalogs = async (req, res) => {
//     try {
//         const result = await Catalog.find();
//         console.log(result);
//         res.status(200).json({ success: true, message: "All Catalog Catalogs returned", data: result })
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const getAllCatalogs = async (req, res) => {
    try {
        const result = await Catalog.find()
        res.status(200).json({ success: true, message: 'Catalogs', data: result })
    } catch (error) {
        console.log(error.message)
    }
}

const createCatalog = async (req, res) => {
    // console.log(req.body)
    const { title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId } = req.body;

    try {
        // if (!req.file) return res.status(400).json({ message: "Image is required" });

        // const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        //     folder: "Catalogs", // Optional: organizes images in Cloudinary folders
        // });

        const { error, value } = CreateCatalogSchema.validate({
            title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId
        })

        if (error) {
            return res.status(401).json({ success: false, error: error.details[0].message })
        }

        const newCatalog = await Catalog.create({
            title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId
        })
        res.status(201).json({ success: true, message: "Catalog Created", data: newCatalog })
    } catch (error) {
        console.log(error)
    }
}

const getCatalog = async (req, res) => {
    try {
        const catalogId = req.params.id;
        // console.log(catalogId)
        const CatalogData = await Catalog.findById(catalogId)

        // console.log(catalogId)
        // console.log(CatalogData)

        if (!catalogId) {
            console.log("No Catalog ID was inputted")
            return res.status(400).json({ status: false, message: "No Catalog ID was inputted" });
        }


        if (!CatalogData) {
            return res.json({ status: false, message: "Could not find a Catalog with that ID" })
        }

        return res.status(200).json({ status: true, message: "Specific Catalog has been gotten successfully", data: CatalogData })
    } catch (error) {
        console.error('Error fetching single Catalog:', error);
        // Check for invalid ID format (Mongoose CastError)
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, error: 'Invalid Catalog ID format' });
        }
        res.status(500).json({ status: false, error: 'Server Error: Could not fetch Catalog.' });
    }
}

const updateCatalog = async (req, res) => {
    const catalogId = req.params.id

    const { title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId } = req.body

    try {
        const { error, value } = CreateCatalogSchema.validate({
            title, category, description, oldPrice, newPrice, isBestSeller, tags, instructor, rating, reviewsCount, imageUrl, publicId
        })

        if (error) {
            return res.status(401).json({ success: false, error: error.details[0].message })
        }

        const existingCatalog = await Catalog.findById(catalogId)
        // console.log(existingCatalog)

        if (!existingCatalog) {
            return res.status(404).json({ status: false, message: "Failed to find the particular Catalog" })
        }

        if (req.body.title != null) {
            existingCatalog.title = req.body.title;
        }

        if (req.body.category != null) {
            existingCatalog.category = req.body.category;
        }

        if (req.body.description != null) {
            existingCatalog.description = req.body.description;
        }

        if (req.body.oldPrice != null) {
            existingCatalog.oldPrice = req.body.oldPrice;
        }

        if (req.body.newPrice != null) {
            existingCatalog.newPrice = req.body.newPrice;
        }

        if (req.body.isBestSeller != null) {
            existingCatalog.isBestSeller = req.body.isBestSeller;
        }

        if (req.body.tags != null) {
            existingCatalog.tags = req.body.tags;
        }

        if (req.body.instructor != null) {
            existingCatalog.instructor = req.body.instructor;
        }

        if (req.body.rating != null) {
            existingCatalog.rating = req.body.rating;
        }

        if (req.body.reviewsCount != null) {
            existingCatalog.reviewsCount = req.body.reviewsCount;
        }

        if (req.body.imageUrl != null) {
            existingCatalog.imageUrl = req.body.imageUrl;
        }

        if (req.body.publicId != null) {
            existingCatalog.publicId = req.body.publicId;
        }

        const updatedCatalog = await existingCatalog.save()
        return res.json({ status: true, message: "Catalog has been updated successfully", data: updatedCatalog })

    } catch (error) {
        console.log(error.message)
    }
}

const deleteCatalog = async (req, res) => {
    try {

        const catalogId = req.params.id
        const existingCatalog = await Catalog.findById(catalogId)
        // console.log(existingCatalog)

        if (!existingCatalog) {
            return res.status(401).json({ status: false, message: "The Catalog you want to delete cannot be found" })
        }

        // Delete from Cloudinary first
        await cloudinary.uploader.destroy(Catalog.publicId);

        await existingCatalog.deleteOne({ catalogId })
        return res.status(201).json({ status: false, message: "Catalog has been deleted successfully" })
    } catch (error) {
        console.log(error.message)
    }

    console.log("Course Catalog is OK!")
}

export default {
    catalogGreeting,
    getAllCatalogs,
    createCatalog,
    getCatalog,
    updateCatalog,
    deleteCatalog
}
// exports.getCatalog = async (req, res) 
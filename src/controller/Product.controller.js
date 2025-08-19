import CouponModel from "../models/Coupon.model.js";
import Product from "../models/Product.model.js";
import mongoose from "mongoose";

// /api/product/search?query=saree under 400&page=1&limit=20
// http://localhost:5008/api/product/search?query=saree above 400&page=1&limit=20
export const searchProducts = async (req, res) => {
  try {
    let { query, page = 1, limit = 20 } = req.query;

    const filter = {};
    let priceFilter = {};
    const lowerQuery = query?.toLowerCase() || "";

    if (lowerQuery.includes("under")) {
      const parts = lowerQuery.split("under");
      query = parts[0].trim();
      priceFilter.$lte = Number(parts[1].trim());
    } else if (lowerQuery.includes("above")) {
      const parts = lowerQuery.split("above");
      query = parts[0].trim();
      priceFilter.$gte = Number(parts[1].trim());
    }

    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    if (query) {
      filter.$or = [
        { productName: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    limit = parseInt(limit);
    const skip = (parseInt(page) - 1) * limit;

    const products = await Product.find(filter).skip(skip).limit(limit);

    const totalResult = await Product.countDocuments(filter);

    res.status(200).json({
      totalResult,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalResult / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    console.log("Uploaded files:", req.files);
    console.log("User info:", req.user);

    const {
      referenceWebsite,
      productName,
      discount,
      price,
      actualPrice,
      category,
      description,
      size,
      material,
      stock,
    } = req.body;

    const imageArray =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    let parsedSizes;
    if (typeof size === "string") {
      try {
        parsedSizes = JSON.parse(size);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid size format. Must be valid JSON array." });
      }
    } else {
      parsedSizes = size;
    }

    // Validation
    // if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "At least one size with price is required." });
    // }

    for (const item of parsedSizes) {
      if (
        !item.sizes ||
        typeof item.sizes !== "string" ||
        item.price == null ||
        item.price < 0
      ) {
        return res.status(400).json({
          message:
            "Each size entry must have a valid 'sizes' string and a non-negative 'price'.",
        });
      }
    }

    console.log("Processed images:", imageArray);
    console.log("Product size:", parsedSizes);
    console.log("Price:", price, "Actual Price:", actualPrice);

    if (actualPrice < 0 || actualPrice > price) {
      console.warn("Invalid actualPrice detected");
      return res.status(400).json({
        message:
          "Invalid actualPrice. It must be a positive value and less than or equal to price.",
      });
    }

    const product = new Product({
      referenceWebsite,
      productName,
      images: imageArray,
      price: Number(price),
      actualPrice: Number(actualPrice),
      category,
      description,
      size: parsedSizes,
      material,
      stock,
      discount: Number(discount),
      addedBy: req.user?.id?.toString(),
    });

    console.log("Saving product to database:", product);

    await product.save();

    console.log("Product saved successfully");

    res.status(200).json({ message: "Product added successfully", product });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res
      .status(500)
      .json({ message: "Failed to add product", error: error.message });
  }
};

export const createMultipleProducts = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Invalid input. Please provide an array of products.",
      });
    }
    const formattedProducts = products.map((product) => ({
      referenceWebsite: "6788b0054c4a217090bf6636",
      productName: product.productName,
      images: typeof product.images === "string" ? [product.images] : [],
      price: product.price,
      actualPrice: product.actualPrice,
      category: product.category,
      description: product.description,
      size: product.size || "M", // Default size is "M" if not provided
      discount: product.discount,
      addedBy: "679c5cc89e0012636ffef9ed",
    }));
    const result = await Product.insertMany(formattedProducts);
    res.status(200).json({
      message: `${result.length} products added successfully`,
      products: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add products", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      referenceWebsite,
      category,
      minPrice = 0,
      maxPrice = 1000000,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      search,
      limit = 100,
      newArrival, // ✅ added
      material,
    } = req.query;

    if (!referenceWebsite) {
      return res.status(400).json({ message: "Missing referenceWebsite" });
    }

    const pipeline = [];

    // Match the website
    pipeline.push({
      $match: {
        referenceWebsite: new mongoose.Types.ObjectId(referenceWebsite),
      },
    });

    // Lookup to join category info
    pipeline.push({
      $lookup: {
        from: "productcategories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    });

    // Flatten the joined category array
    pipeline.push({ $unwind: "$category" });


    pipeline.push({
      $lookup: {
        from: "coupons",
        localField: "coupon",
        foreignField: "_id",
        as: "couponDetails",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$couponDetails",
        preserveNullAndEmptyArrays: true,
      },
    });


    // Match by category name (case-insensitive)
    if (search) {
      pipeline.push({
        $match: {
          productName: {
            $regex: new RegExp(search, "i"), // case-insensitive exact match
          },
        },
      });
    }
    if (material) {
      pipeline.push({
        $match: {
          material: { $regex: new RegExp(material, "i") },
        },
      });
    }

    // Match by category name (case-insensitive)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        pipeline.push({
          $match: {
            "category._id": new mongoose.Types.ObjectId(category),
          },
        });
      } else {
        pipeline.push({
          $match: {
            "category.name": {
              $regex: new RegExp(category, "i"), // case-insensitive exact match
            },
          },
        });
      }
    }

    // Filter by price range
    pipeline.push({
      $match: {
        price: {
          $gte: parseFloat(minPrice),
          $lte: parseFloat(maxPrice),
        },
      },
    });

    // ✅ Filter by new arrivals (last 15 days)
    if (newArrival === "true") {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      pipeline.push({
        $match: {
          createdAt: { $gte: fifteenDaysAgo },
        },
      });
    }

    // Sorting
    pipeline.push({
      $sort: {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      },
    });

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    console.log(pipeline);

    // Execute aggregation for products
    const products = await Product.aggregate(pipeline);

    // Count total documents (excluding pagination stages)
    const countPipeline = pipeline.filter(
      (stage) => !stage.$skip && !stage.$limit && !stage.$sort
    );
    countPipeline.push({ $count: "total" });

    const countResult = await Product.aggregate(countPipeline);
    const totalDocuments = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalDocuments / limit);

    return res.status(200).json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        totalDocuments,
        currentPage: parseInt(page),
        pageSize: parseInt(limit),
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      message: "Failed to retrieve products",
      error: error.message,
    });
  }
};

// export const getProducts = async (req, res) => {
//     try {
//         const {
//             referenceWebsite,
//             search,
//             category, // Specific category filter
//             minPrice,
//             maxPrice,
//             sortBy = 'createdAt', // Sorting field
//             sortOrder = 'desc',   // Sorting order
//             page = 1,
//             limit = 10,
//         } = req.query;

//         const user = req.user?.id?.toString();
//         const role = req.user?.role;

//         if (!referenceWebsite) {
//             return res.status(400).json({ message: "Reference website is required" });
//         }

//         const pageNumber = parseInt(page, 10) || 1;
//         const pageSize = parseInt(limit, 10) || 10;

//         const website = await Websitelist.findById(referenceWebsite);
//         if (!website) {
//             return res.status(404).json({ message: "Reference website not found" });
//         }

//         if (website?.categories.length === 0) {
//             return res.status(200).json({
//                 products: [],
//                 pagination: {
//                     totalDocuments: 0,
//                     currentPage: pageNumber,
//                     pageSize,
//                     totalPages: 0,
//                 },
//             });
//         }

//         const matchStage = {
//             category: { $in: website.categories }, // Only products in website's categories
//         };

//         if (role && role !== "admin") matchStage.addedBy = user;

//         if (category) {
//             matchStage.category = new mongoose.Types.ObjectId(category);
//         }

//         if (search) {
//             matchStage.$or = [
//                 { productName: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } },
//             ];
//         }

//         if (minPrice || maxPrice) {
//             matchStage.actualPrice = {};
//             if (minPrice) matchStage.actualPrice.$gte = parseFloat(minPrice);
//             if (maxPrice) matchStage.actualPrice.$lte = parseFloat(maxPrice);
//         }

//         const pipeline = [
//             { $match: matchStage },
//             {
//                 $lookup: {
//                     from: 'productcategories', // Name of the categories collection
//                     localField: 'category',
//                     foreignField: '_id',
//                     as: 'category',
//                 },
//             },
//             {
//                 $unwind: {
//                     path: '$category',
//                     preserveNullAndEmptyArrays: true,
//                 },
//             },
//             {
//                 $addFields: {
//                     category: {
//                         _id: '$category._id',
//                         name: '$category.name',
//                     },
//                 },
//             },
//             {
//                 $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
//             },
//             {
//                 $facet: {
//                     metadata: [
//                         { $count: 'totalDocuments' },
//                         {
//                             $addFields: {
//                                 currentPage: pageNumber,
//                                 pageSize,
//                                 totalPages: { $ceil: { $divide: ['$totalDocuments', pageSize] } },
//                             },
//                         },
//                     ],
//                     products: [
//                         { $skip: (pageNumber - 1) * pageSize },
//                         { $limit: pageSize },
//                     ],
//                 },
//             },
//         ];

//         // Execute the aggregation pipeline
//         const results = await Product.aggregate(pipeline);

//         const metadata = results[0]?.metadata[0] || {
//             totalDocuments: 0,
//             currentPage: pageNumber,
//             pageSize,
//             totalPages: 0,
//         };
//         const products = results[0]?.products || [];

//         // Return the response
//         res.status(200).json({
//             products,
//             pagination: metadata,
//         });
//     } catch (error) {
//         console.error('Error in getProducts:', error.message);
//         res.status(500).json({ message: 'Failed to retrieve products', error: error.message });
//     }
// };

export const getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(200)
      .json({ message: "Product retrieved successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve product", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      price,
      actualPrice,
      discount,
      category,
      description,
      size,
      material,
      stock,
    } = req.body;

    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageArray =
      req.files && req.files.length > 0
        ? req.files.map((file) => `/uploads/${file.filename}`)
        : existingProduct.images;

    let parsedSizes;
    if (typeof size === "string") {
      try {
        parsedSizes = JSON.parse(size);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid size format. Must be valid JSON array." });
      }
    } else {
      parsedSizes = size;
    }

    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one size with price is required." });
    }

    for (const item of parsedSizes) {
      if (
        !item.sizes ||
        typeof item.sizes !== "string" ||
        item.price == null ||
        item.price < 0
      ) {
        return res.status(400).json({
          message:
            "Each size entry must have a valid 'sizes' string and a non-negative 'price'.",
        });
      }
    }

    if (actualPrice < 0 || actualPrice > price) {
      return res.status(400).json({
        message:
          "Invalid actualPrice. It must be a positive value and less than or equal to price.",
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        images: imageArray,
        price,
        actualPrice: actualPrice || 0,
        category,
        description,
        size: parsedSizes,
        discount,
        material,
        stock,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

// apply-coupon
export const applyCouponOnProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { couponId } = req.body;


    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }


    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: "Coupon is inactive" });
    }
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    // const now = new Date();
    // if (now < startDate) {
    //   return res.status(400).json({ success: false, message: "Coupon is not yet valid" });
    // }
    // if (now > endDate) {
    //   return res.status(400).json({ success: false, message: "Coupon has expired" });
    // }


    const product = await Product.findByIdAndUpdate(
      productId,
      { coupon: coupon._id },
      { new: true }
    ).populate("coupon");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Coupon applied successfully",
      data: product
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


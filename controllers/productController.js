const fs = require("fs");
const Product = require("../models/productModel");

const createProduct = async (req, res) => {
  const { title, price, img, size, description, category, brand, count } =
    req.body;
  try {
    const newProduct = await Product.create({
      title,
      price,
      img,
      size,
      description,
      category,
      brand,
      count,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.status(202).json({ message: "Product Updated Successfully" });
  } catch (err) {
    res.status(202).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(202).json({ message: "Delete Successfull!!" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    //Filtring
    const queryObj = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((item) => delete queryObj[item]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    //Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
    //Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }
    //Pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exists");
    }
    const products = await query;
    res.status(200).json(products);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id }).populate({
      path: "ratings",
      populate: {
        path: "postedby",
        select: { _id: 1, username: 1 },
      },
    });
    res.status(202).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const rating = async (req, res) => {
  try {
    const { _id } = req.user;
    const { star, productId, comment } = req.body;
    let aProduct;
    const product = await Product.findOne({ _id: productId });
    let alreadyRated = product.ratings.find(
      (item) => item.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      aProduct = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
        { new: true }
      );
      res.status(202);
    } else {
      aProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star,
              comment,
              postedby: _id,
            },
          },
        },
        { new: true }
      );
      res.status(203);
    }
    const productRatings = await Product.findOne({ _id: productId });
    let totalRating = productRatings.ratings.length;
    let ratingsum = productRatings.ratings
      .map((item) => item.star)
      .reduce((prev, cur) => prev + cur, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    aProduct = await Product.findByIdAndUpdate(
      productId,
      { totalrating: actualRating },
      { new: true }
    );
    res.json(aProduct);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  rating,
  editProduct,
  deleteProduct,
};

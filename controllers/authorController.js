import Author from "../models/Author.js";

// CREATE
export const createAuthor = async (req, res, next) => {
  try {
    const { name, shortBio, fullBio, email, socialLinks } = req.body;

    const author = new Author({
      name,
      shortBio,
      fullBio,
      email,
      socialLinks,
      photo: req.file?.path // cloudinary URL
    });

    const saved = await author.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// GET ALL
export const getAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    next(err);
  }
};

// GET SINGLE + BLOGS
import Blog from "../models/Blog.js";

export const getAuthorWithBlogs = async (req, res, next) => {
  try {
    const author = await Author.findById(req.params.id);

    if (!author) return res.status(404).json({ message: "Author not found" });

    const blogs = await Blog.find({ author_id: author._id })
      .select("title slug cover_image_url createdAt");

    res.json({ author, blogs });
  } catch (err) {
    next(err);
  }
};

// UPDATE
export const updateAuthor = async (req, res, next) => {
  try {
    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.photo = req.file.path;
    }

    const updated = await Author.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE
export const deleteAuthor = async (req, res, next) => {
  try {
    await Author.findByIdAndDelete(req.params.id);
    res.json({ message: "Author deleted" });
  } catch (err) {
    next(err);
  }
};
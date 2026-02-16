const upload = require("../middlewares/uploadBlogImage");
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    return res.status(200).json({
      imageUrl: req.file.path,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Upload failed",
      error: err.message,
    });
  }
});

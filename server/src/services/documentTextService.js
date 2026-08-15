const path = require("path");
const { PDFParse } = require("pdf-parse");

const extractText = async (file) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  if (extension === ".pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const data = await parser.getText();

      if (!data.text || !data.text.trim()) {
        const error = new Error(
          "Could not extract text from PDF"
        );

        error.statusCode = 400;

        throw error;
      }

      return data.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  return file.buffer.toString("utf-8");
};

module.exports = {
  extractText,
};
const pdfParse = require("pdf-parse");

const {
  extractText,
} = require("../services/documentTextService");

jest.mock("pdf-parse", () => ({
  PDFParse: jest.fn(),
}));

describe("Document Text Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Non-PDF files", () => {
    test("should extract text from a text file", async () => {
      const file = {
        originalname: "test.txt",
        buffer: Buffer.from(
          "This is a DevLens test document."
        ),
      };

      const result = await extractText(file);

      expect(result).toBe(
        "This is a DevLens test document."
      );

      expect(pdfParse.PDFParse).not.toHaveBeenCalled();
    });

    test("should extract text from a JavaScript file", async () => {
      const javascriptContent = `
        const message = "Hello DevLens";
        console.log(message);
      `;

      const file = {
        originalname: "app.js",
        buffer: Buffer.from(javascriptContent),
      };

      const result = await extractText(file);

      expect(result).toBe(javascriptContent);

      expect(pdfParse.PDFParse).not.toHaveBeenCalled();
    });

    test("should extract text from a Markdown file", async () => {
      const markdownContent = `
# DevLens

This is a documentation file.
`;

      const file = {
        originalname: "README.md",
        buffer: Buffer.from(markdownContent),
      };

      const result = await extractText(file);

      expect(result).toBe(markdownContent);

      expect(pdfParse.PDFParse).not.toHaveBeenCalled();
    });
  });

  describe("PDF files", () => {
    test("should extract text from a PDF", async () => {
      const getText = jest.fn().mockResolvedValue({
        text: "This is extracted PDF content.",
      });

      const destroy = jest.fn().mockResolvedValue();

      pdfParse.PDFParse.mockImplementationOnce(() => ({
        getText,
        destroy,
      }));

      const file = {
        originalname: "document.pdf",
        buffer: Buffer.from("fake pdf content"),
      };

      const result = await extractText(file);

      expect(result).toBe(
        "This is extracted PDF content."
      );

      expect(pdfParse.PDFParse).toHaveBeenCalledTimes(1);
      expect(getText).toHaveBeenCalledTimes(1);
      expect(destroy).toHaveBeenCalledTimes(1);
    });

    test("should trim extracted PDF text", async () => {
      const getText = jest.fn().mockResolvedValue({
        text: "   DevLens PDF content   ",
      });

      const destroy = jest.fn().mockResolvedValue();

      pdfParse.PDFParse.mockImplementationOnce(() => ({
        getText,
        destroy,
      }));

      const file = {
        originalname: "document.pdf",
        buffer: Buffer.from("fake pdf content"),
      };

      const result = await extractText(file);

      expect(result).toBe("DevLens PDF content");
      expect(destroy).toHaveBeenCalledTimes(1);
    });

    test("should reject PDF when no text is extracted", async () => {
      const getText = jest.fn().mockResolvedValue({
        text: "",
      });

      const destroy = jest.fn().mockResolvedValue();

      pdfParse.PDFParse.mockImplementationOnce(() => ({
        getText,
        destroy,
      }));

      const file = {
        originalname: "empty.pdf",
        buffer: Buffer.from("fake pdf content"),
      };

      await expect(
        extractText(file)
      ).rejects.toMatchObject({
        message: "Could not extract text from PDF",
        statusCode: 400,
      });

      expect(destroy).toHaveBeenCalledTimes(1);
    });

    test("should reject PDF when extracted text contains only whitespace", async () => {
      const getText = jest.fn().mockResolvedValue({
        text: "   \n\t   ",
      });

      const destroy = jest.fn().mockResolvedValue();

      pdfParse.PDFParse.mockImplementationOnce(() => ({
        getText,
        destroy,
      }));

      const file = {
        originalname: "empty.pdf",
        buffer: Buffer.from("fake pdf content"),
      };

      await expect(
        extractText(file)
      ).rejects.toMatchObject({
        message: "Could not extract text from PDF",
        statusCode: 400,
      });

      expect(destroy).toHaveBeenCalledTimes(1);
    });

    test("should propagate PDF parsing errors", async () => {
      const getText = jest.fn().mockRejectedValue(
        new Error("PDF parsing failed")
      );

      const destroy = jest.fn().mockResolvedValue();

      pdfParse.PDFParse.mockImplementationOnce(() => ({
        getText,
        destroy,
      }));

      const file = {
        originalname: "broken.pdf",
        buffer: Buffer.from("broken pdf"),
      };

      await expect(
        extractText(file)
      ).rejects.toThrow("PDF parsing failed");

      expect(destroy).toHaveBeenCalled();
    });
  });
});
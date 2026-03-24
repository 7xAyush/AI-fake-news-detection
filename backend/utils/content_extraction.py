from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
from werkzeug.datastructures import FileStorage


def extract_text_from_url(url: str, timeout: int = 8) -> str:
    """
    Fetch the URL and extract main text content using BeautifulSoup.
    This is a simple heuristic: we join all paragraph (<p>) tags.
    """
    url = url.strip()
    if not url:
        raise ValueError("URL is empty.")

    resp = requests.get(url, timeout=timeout)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
    text = "\n".join(p for p in paragraphs if p)

    if not text:
        # Fallback to the full text content.
        text = soup.get_text(separator=" ", strip=True)

    if not text:
        raise ValueError("Could not extract meaningful text content from URL.")

    return text


def _read_txt_file(upload: FileStorage) -> str:
    raw = upload.read()
    try:
        return raw.decode("utf-8")
    except UnicodeDecodeError:
        return raw.decode("latin-1", errors="ignore")


def _read_pdf_file(upload: FileStorage) -> str:
    """
    Extract text from a PDF file using PyPDF2.
    This is basic but sufficient for demo purposes.
    """
    from io import BytesIO

    data = BytesIO(upload.read())
    reader = PdfReader(data)
    pages_text = []
    for page in reader.pages:
        try:
            page_text: Optional[str] = page.extract_text()
        except Exception:
            page_text = None
        if page_text:
            pages_text.append(page_text)
    text = "\n".join(pages_text).strip()
    if not text:
        raise ValueError("Could not extract text from PDF file.")
    return text


def extract_text_from_file(upload: FileStorage) -> str:
    """
    Extract text from an uploaded file.

    - .txt files are read as plain text.
    - .pdf files are parsed using PyPDF2.
    """
    if upload is None or upload.filename is None:
        raise ValueError("No file uploaded.")

    filename = upload.filename.lower()
    suffix = Path(filename).suffix
    content_type = upload.mimetype or ""

    if suffix == ".txt" or content_type.startswith("text/"):
        return _read_txt_file(upload)

    if suffix == ".pdf" or "pdf" in content_type:
        return _read_pdf_file(upload)

    raise ValueError("Unsupported file type. Please upload a .txt or .pdf file.")


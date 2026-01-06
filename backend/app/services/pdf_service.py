from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os


def generate_simple_pdf(filename: str, title: str, lines: list[str]) -> str:
    """
    Gera um PDF simples com título e linhas de texto.
    Retorna o caminho do arquivo gerado.
    """

    output_dir = "tmp"
    os.makedirs(output_dir, exist_ok=True)

    path = os.path.join(output_dir, filename)

    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, title)

    y -= 40
    c.setFont("Helvetica", 11)

    for line in lines:
        c.drawString(50, y, line)
        y -= 18

    c.save()
    return path

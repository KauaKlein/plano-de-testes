import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async () => {
  const element = document.getElementById('pdf-content');
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    let yPosition = 0;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let pages = Math.ceil(imgHeight / pageHeight);

    for (let i = 0; i < pages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(
        imgData,
        'PNG',
        0,
        yPosition,
        pageWidth,
        imgHeight,
      );
      yPosition -= pageHeight;
    }

    pdf.save('plano-de-testes-gerar-matricula.pdf');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
  }
};

export const downloadPDF = () => {
  generatePDF();
};

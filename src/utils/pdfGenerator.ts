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
      useCORS: true,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Adiciona primeira página
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adiciona páginas adicionais se necessário
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save('plano-de-testes-gerar-matricula.pdf');
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Erro ao gerar PDF. Tente novamente.');
  }
};

export const downloadPDF = () => {
  generatePDF();
};

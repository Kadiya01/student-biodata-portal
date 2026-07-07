import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateRegistrationPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    // Fallback: generate a basic text PDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Rauda College of Health Science and Technology', 20, 20);
    doc.setFontSize(12);
    doc.text('Registration Summary', 20, 30);
    doc.text('Could not generate detailed summary. Please use Print instead.', 20, 50);
    doc.save(`${filename}.pdf`);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const doc = new jsPDF('p', 'mm', 'a4');
  let heightLeft = imgHeight;
  let position = 10;

  doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
  heightLeft -= doc.internal.pageSize.getHeight() - 20;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    doc.addPage();
    doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
    heightLeft -= doc.internal.pageSize.getHeight() - 20;
  }

  doc.save(`${filename}.pdf`);
}

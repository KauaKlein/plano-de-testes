import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Packer } from 'docx';
import { saveAs } from 'file-saver';

interface CAData {
  id: string;
  title: string;
  descricao: string;
}

export async function generateDOCX(
  titulo: string,
  tipoTeste: string,
  preCondicoes: string,
  cas: CAData[]
) {
  const children: Paragraph[] = [];

  // Header
  children.push(
    new Paragraph({
      text: titulo,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Data: ${new Date().toLocaleDateString('pt-BR')} | Total: ${cas.length} CAs`,
        }),
        ...(tipoTeste ? [new TextRun({ text: ` | ${tipoTeste}` })] : []),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Pré-requisitos
  if (preCondicoes) {
    children.push(
      new Paragraph({
        text: 'Pré-requisitos',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: '00BFA5',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    const preRequisitos = preCondicoes.split(';').filter(item => item.trim());
    preRequisitos.forEach((item, idx) => {
      children.push(
        new Paragraph({
          text: `${idx + 1}. ${item.trim()}`,
          spacing: { after: 100 },
        })
      );
    });

    children.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );
  }

  // Critérios de Aceite
  children.push(
    new Paragraph({
      text: 'Critérios de Aceite - Passo a Passo',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      border: {
        bottom: {
          color: '00BFA5',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    })
  );

  cas.forEach((ca, index) => {
    // Page break a cada 2 CAs
    const shouldBreakBefore = index > 0 && index % 2 === 0;

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${ca.id} - ${ca.title}`,
            bold: true,
            size: 28,
            color: '00BFA5',
          }),
        ],
        spacing: { before: 300, after: 200 },
        pageBreakBefore: shouldBreakBefore,
      })
    );

    // Dividir descrição em passos numerados
    const passos = ca.descricao.split(/(?=\d+\.\s)/).filter(p => p.trim());
    
    if (passos.length > 1) {
      // Tem múltiplos passos numerados
      passos.forEach((passo) => {
        children.push(
          new Paragraph({
            text: passo.trim(),
            spacing: { after: 200 },
          })
        );
      });
    } else {
      // Descrição sem passos numerados
      children.push(
        new Paragraph({
          text: ca.descricao,
          spacing: { after: 300 },
        })
      );
    }

    // Espaço extra após cada CA
    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 },
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${titulo.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  saveAs(blob, fileName);
}

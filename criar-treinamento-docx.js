import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
        PageBreak, UnderlineType, VerticalAlign } from 'docx';
import fs from 'fs';

const border = { style: BorderStyle.SINGLE, size: 6, color: "E0E0E0" };
const borders = { top: border, bottom: border, left: border, right: border };

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 32, bold: true, color: "FF6600" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 28, bold: true, color: "FF6600" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // CAPA
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600, after: 200 },
        children: [new TextRun({ text: "ALIRIA", bold: true, size: 48, color: "FF6600" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Gestão de Pessoas", size: 24, color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "📱 Treinamento", bold: true, size: 36 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Atendimento Empático em Chatbot", bold: true, size: 32, color: "FF6600" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 80 },
        children: [new TextRun({ text: "Duração: 2 horas", size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "Modalidade: Online", size: 22 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Maio 2026", size: 22, italic: true })]
      }),

      new PageBreak(),

      // ÍNDICE
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Índice")]
      }),
      new Paragraph({
        children: [new TextRun("1. Objetivos de Aprendizagem")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("2. Fundamentos do Atendimento em Chatbot")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("3. Como Falar e Escrever")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("4. Gentilezas e Empatia")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("5. Boas Práticas de Comunicação")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("6. Situações Delicadas")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("7. Exemplos Completos")],
        spacing: { after: 400 }
      }),

      new PageBreak(),

      // OBJETIVOS
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("🎯 Objetivos de Aprendizagem")]
      }),
      new Paragraph({
        children: [new TextRun("Ao final deste treinamento, você será capaz de:")],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Comunicar-se com clareza e gentileza via chatbot")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Demonstrar empatia em textos digitais")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Resolver dúvidas com eficiência")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Manter tom profissional e acessível")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Aplicar melhores práticas de atendimento digital")],
        spacing: { after: 400 }
      }),

      new PageBreak(),

      // MÓDULO 1
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Módulo 1: Fundamentos do Atendimento em Chatbot")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Por que o Chatbot é Importante?")]
      }),
      new Paragraph({
        children: [new TextRun("O chatbot é muitas vezes o ", { bold: false }),
                   new TextRun("primeiro contato do paciente", { bold: true }),
                   new TextRun(" com a Aliria.")],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun("Paciente → Chatbot (primeira impressão) → Atendimento humano")],
        spacing: { after: 300 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Os 3 Pilares do Bom Atendimento")]
      }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 25, type: WidthType.PERCENTAGE },
                shading: { fill: "FF6600", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Pilar", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders, width: { size: 35, type: WidthType.PERCENTAGE },
                shading: { fill: "FF6600", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true, color: "FFFFFF" })] })]
              }),
              new TableCell({
                borders, width: { size: 40, type: WidthType.PERCENTAGE },
                shading: { fill: "FF6600", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Exemplo", bold: true, color: "FFFFFF" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Clareza", bold: true })] })]
              }),
              new TableCell({
                borders, width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph("Mensagens diretas, sem ambiguidade")]
              }),
              new TableCell({
                borders, width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph("✓ Sim, pode realizar em 5 minutos")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Empatia", bold: true })] })]
              }),
              new TableCell({
                borders, width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph("Reconhecimento de sentimentos")]
              }),
              new TableCell({
                borders, width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph("✓ Entendo sua preocupação!")]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                borders, width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: "Eficiência", bold: true })] })]
              }),
              new TableCell({
                borders, width: { size: 35, type: WidthType.PERCENTAGE },
                children: [new Paragraph("Respostas rápidas e precisas")]
              }),
              new TableCell({
                borders, width: { size: 40, type: WidthType.PERCENTAGE },
                children: [new Paragraph("✓ 2-3 mensagens claras")]
              })
            ]
          })
        ]
      }),
      new Paragraph({ spacing: { after: 400 }, children: [new TextRun("")] }),

      new PageBreak(),

      // MÓDULO 2
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Módulo 2: Como Falar e Escrever")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Tom de Voz Ideal")]
      }),
      new Paragraph({
        children: [new TextRun("Use um tom:")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Profissional - Competente, seguro")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Amigável - Acessível, personalizado")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Respeitoso - Formal quando necessário")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✓ Empático - Compreensivo das dificuldades")],
        spacing: { after: 200 }
      }),

      new Paragraph({
        children: [new TextRun("Evite:")],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("✗ Tom robótico ou frio")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✗ Gírias excessivas")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✗ Jargão técnico sem explicação")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("✗ Instruções complexas")],
        spacing: { after: 300 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Exemplos: Errado vs. Certo")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "❌ ERRADO:", bold: true })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Cadastro de paciente: insira CPF, nome completo, data de nascimento, telefone, email, endereço. Máximo 100 caracteres.")],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "✓ CERTO:", bold: true, color: "008000" })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Ótimo! Vamos começar seu cadastro.\n\n1️⃣ Qual é seu CPF? (11 dígitos)\n2️⃣ Seu nome completo?\n\nPode responder com calma!")],
        spacing: { after: 400 }
      }),

      new PageBreak(),

      // MÓDULO 3
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Módulo 3: Gentilezas e Empatia")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Palavras-Chave de Gentileza")]
      }),
      new Paragraph({
        children: [new TextRun("Use frequentemente: Por favor, obrigado, desculpa, entendo, claro, sem problema, com prazer, fico feliz em ajudar, deixa comigo, relaxa, estou aqui para você")],
        spacing: { after: 300 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Frases Mágicas")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Para Começar")]
      }),
      new Paragraph({
        children: [new TextRun("Olá! Bem-vindo à Aliria! 👋 Como posso ajudá-lo hoje?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Oi! Tudo bem? O que você precisa?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Que legal ter você aqui! Em que posso ser útil?")],
        spacing: { after: 300 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Para Pedir Desculpas")]
      }),
      new Paragraph({
        children: [new TextRun("Desculpa pelo transtorno! Deixa comigo.")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Entendo que isso foi frustrante. Vou corrigir.")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Mil desculpas! Não deveria ter acontecido.")],
        spacing: { after: 300 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Para Encerrar")]
      }),
      new Paragraph({
        children: [new TextRun("Fico feliz em ter ajudado! 😊 Qualquer coisa, é só chamar!")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Obrigado por conversar comigo! Vou ficar feliz se precisar novamente.")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("Tudo resolvido? Ótimo! Volte sempre!")],
        spacing: { after: 400 }
      }),

      new PageBreak(),

      // MÓDULO 4
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("Módulo 4: Boas Práticas de Comunicação")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Tamanho das Mensagens")]
      }),
      new Paragraph({
        children: [new TextRun({ text: "Regra: ", bold: true }), new TextRun("Uma ideia por mensagem. Máximo 3 linhas.")],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "❌ ERRADO (texto grande demais):", bold: true })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Para realizar o cadastro você deve preencher os campos com seus dados pessoais incluindo CPF, RG, data de nascimento, telefone, email e endereço completo...")],
        spacing: { after: 200 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "✓ CERTO (quebrado em partes):", bold: true, color: "008000" })],
        spacing: { after: 100 }
      }),
      new Paragraph({
        children: [new TextRun("Olá! Vamos fazer seu cadastro? 😊\n\nPreciso de alguns dados:\n- CPF\n- Nome completo\n- Telefone\n\nPode começar?")],
        spacing: { after: 400 }
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Checklist de Qualidade")]
      }),
      new Paragraph({
        children: [new TextRun("Antes de enviar sua mensagem, pergunte-se:")],
        spacing: { after: 150 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Clareza: Alguém que não sabe do assunto entenderia?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Empatia: Demonstra preocupação com o paciente?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Brevidade: Tem menos de 3 linhas?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Tom: Profissional mas acessível?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Próximo passo: Fica claro o que fazer depois?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Gentileza: Tem palavras de gentileza?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Sem erros: Sem typos, bem-formatado?")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("☐ Pessoal: Usa o nome do paciente ou referência pessoal?")],
        spacing: { after: 400 }
      }),

      new PageBreak(),

      // CONCLUSÃO
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("🎓 Conclusão")]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("Pontos-Chave a Lembrar")]
      }),
      new Paragraph({
        children: [new TextRun("1. Clareza acima de tudo - O paciente deve entender de primeira")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("2. Empatia é seu superpower - Conecte-se com o sentimento")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("3. Gentileza custa nada - Use palavras mágicas sempre")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("4. Brevidade é ouro - Uma boa mensagem é concisa")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("5. Personalize - Use nome, contexto, histórico")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("6. Próximo passo claro - Sempre deixe óbvio o que fazer")],
        spacing: { after: 80 }
      }),
      new Paragraph({
        children: [new TextRun("7. Humanize a máquina - Lembre que é um HUMANO atrás do chatbot")],
        spacing: { after: 400 }
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "🎉 Parabéns!", bold: true, size: 28 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun("Você completou o treinamento de Atendimento Empático em Chatbot!")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 200 },
        children: [new TextRun("Agora está pronto para criar conversas que resolvem problemas,")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun("geram confiança e deixam pacientes felizes!")]
      }),

      new Paragraph({
        spacing: { before: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "FF6600", space: 1 } },
        children: [new TextRun("")]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [new TextRun({ text: "Treinamento criado para a equipe Aliria", italic: true, size: 20 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Maio 2026 • Versão 1.0", italic: true, size: 20 })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Treinamento-Atendimento-Empatico-em-Chatbot.docx", buffer);
  console.log("✅ Documento criado com sucesso!");
  console.log("📄 Arquivo: Treinamento-Atendimento-Empatico-em-Chatbot.docx");
});

import { jsPDF } from 'jspdf'

/**
 * Gera um PDF de uma anamnese respondida.
 * @param {object} anamnesis - O objeto completo da anamnese respondida.
 * @param {object} patient - O objeto com os dados do paciente.
 * @param {object} clinic - O objeto com os dados da clínica.
 * @returns {object} - Retorna o nome do arquivo e a URL de dados do PDF gerado.
 */
export async function generateAnamnesisPdf(anamnesis, patient, clinic) {
  const doc = new jsPDF()
  let yPos = 20
  const margin = 20
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const usableWidth = pageWidth - margin * 2

  function checkNewPage(neededHeight = 20) {
    if (yPos + neededHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
    }
  }

  const formatSimpleDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }
  const formattedBirthDate = patient?.birthDate
    ? new Date(patient.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    : ''

  // --- CABEÇALHO DA CLÍNICA ---
  if (clinic?.logoUrl) {
    try {
      const response = await fetch(clinic.logoUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      await new Promise((resolve) => (reader.onloadend = resolve))
      const imgData = reader.result
      doc.addImage(imgData, 'PNG', margin, yPos, 30, 30, undefined, 'FAST')
    } catch (e) {
      console.error('Erro ao carregar logo da clínica:', e)
    }
  }
  doc.setFontSize(16)
  doc.setFont(undefined, 'bold')
  doc.text(clinic?.name || 'Ficha de Anamnese', pageWidth - margin, yPos + 10, {
    align: 'right',
  })
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(clinic?.address?.street || '', pageWidth - margin, yPos + 18, { align: 'right' })
  doc.text(clinic?.phone || '', pageWidth - margin, yPos + 24, { align: 'right' })
  yPos += 45

  // --- DADOS DO PACIENTE ---
  doc.setDrawColor('#e5e7eb')
  doc.line(margin, yPos - 10, pageWidth - margin, yPos - 10)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('INFORMAÇÕES DO PACIENTE', margin, yPos)
  yPos += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.text(`Nome: ${patient?.name || ''}`, margin, yPos)
  doc.text(`CPF: ${patient?.cpf || ''}`, pageWidth / 2, yPos)
  yPos += 6
  doc.text(`Data de Nasc.: ${formattedBirthDate || ''}`, margin, yPos)
  doc.text(`Gênero: ${patient?.gender || ''}`, pageWidth / 2, yPos)
  yPos += 15

  // --- TÍTULO DA ANAMNESE ---
  doc.line(margin, yPos - 8, pageWidth - margin, yPos - 8)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text(anamnesis.template.name, pageWidth / 2, yPos, { align: 'center' })
  yPos += 6
  doc.setFontSize(9)
  doc.setFont(undefined, 'italic')
  doc.setTextColor('#6b7281')
  doc.text(`Respondido em: ${formatSimpleDate(anamnesis.updatedAt)}`, pageWidth / 2, yPos, {
    align: 'center',
  })
  yPos += 15
  doc.setTextColor('#000000')

  // --- PERGUNTAS E RESPOSTAS ---
  anamnesis.answers.forEach((item, index) => {
    const questions = anamnesis.template?.questions || []
    const question = questions.find((q) => q.title === item.questionTitle)
    if (!question) return

    checkNewPage(20)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    const questionText = `${index + 1}. ${item.questionTitle}`
    const questionLines = doc.splitTextToSize(questionText, usableWidth)
    doc.text(questionLines, margin, yPos)
    yPos += questionLines.length * 5

    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    switch (question.questionType) {
      case 'text':
      case 'long_text':
        const answerText = item.answer || ' '
        const textLines = doc.splitTextToSize(answerText, usableWidth)
        checkNewPage(textLines.length * 5 + 5)
        doc.text(textLines, margin, yPos)
        doc.setDrawColor('#9ca3af')
        for (let i = 0; i < textLines.length; i++) {
          doc.line(margin, yPos + i * 5 + 1, margin + usableWidth, yPos + i * 5 + 1)
        }
        yPos += textLines.length * 5 + 8
        break

      case 'yes_no':
        checkNewPage(15)
        doc.text(`( ${item.answer === 'Sim' ? 'X' : ' '} ) Sim`, margin, yPos)
        doc.text(`( ${item.answer === 'Não' ? 'X' : ' '} ) Não`, margin + 30, yPos)
        yPos += 10
        break

      case 'single_choice':
      case 'multiple_choice':
        const selectedAnswers = Array.isArray(item.answer) ? item.answer : [item.answer]
        const options = Array.isArray(question.options) ? question.options : []
        checkNewPage(options.length * 6 + 5)
        options.forEach((option) => {
          doc.text(`( ${selectedAnswers.includes(option) ? 'X' : ' '} ) ${option}`, margin, yPos)
          yPos += 6
        })
        yPos += 4
        break

      default:
        doc.text(String(item.answer || ''), margin, yPos)
        yPos += 10
    }
  })

  // --- RODAPÉ ---
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor('#9ca3af')
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  // --- RETORNA OS DADOS DO PDF ---
  const fileName = `Anamnese_${patient?.name.replace(/\s+/g, '_')}_${anamnesis.template.name.replace(/\s+/g, '_')}.pdf`
  const pdfDataUri = doc.output('datauristring')

  return { fileName, pdfDataUri }
}

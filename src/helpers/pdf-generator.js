import { jsPDF } from 'jspdf'
// ✨ 1. Importar a função da API
import { getAnamnesisTemplateById } from '@/api/anamnesis'

/**
 * Gera um PDF de uma anamnese respondida.
 * @param {object} anamnesis - O objeto completo da anamnese respondida.
 * @param {object} patient - O objeto com os dados do paciente.
 * @param {object} clinic - O objeto com os dados da clínica.
 * @returns {object} - Retorna { fileName, pdfUrl } ou { error }
 */
export async function generateAnamnesisPdf(anamnesis, patient, clinic) {
  // ✨ 2. Envolver tudo em um try...catch para evitar falhas silenciosas
  try {
    const doc = new jsPDF()
    let yPos = 20
    const margin = 20
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const usableWidth = pageWidth - margin * 2

    // --- Helpers Globais ---
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
      ? new Date(patient.birthDate).toLocaleDateString('pt-BR', {
          timeZone: 'UTC',
        })
      : ''

    const getSubQuestionLetter = (index) => String.fromCharCode(65 + index)

    // --- ✨ 3. Lógica para buscar o template completo (A CORREÇÃO) ---
    let fullTemplate = anamnesis.template

    // Verifica se o template não está populado (como no bug anterior)
    if (
      !fullTemplate ||
      !fullTemplate.questions ||
      fullTemplate.questions.length === 0
    ) {
      console.warn(
        'Template incompleto no objeto anamnese. Buscando template completo...',
      )
      try {
        // Busca o template completo da API
        const templateData = await getAnamnesisTemplateById(fullTemplate._id)
        if (!templateData || !templateData.questions) {
          throw new Error('Não foi possível carregar as perguntas do template.')
        }
        fullTemplate = templateData // Substitui pelo template completo
      } catch (apiError) {
        console.error(
          'Falha ao buscar template completo para o PDF:',
          apiError,
        )
        // Lança o erro para o toast.error no componente
        throw new Error(
          `Falha ao buscar dados do template: ${apiError.message}`,
        )
      }
    }

    // --- Mapa de Respostas ---
    const answersMap = (anamnesis.answers || []).reduce((acc, ans) => {
      acc[ans.qId] = ans
      return acc
    }, {})

    // --- CABEÇALHO DA CLÍNICA ---
    if (clinic?.logoUrl) {
      try {
        const response = await fetch(clinic.logoUrl)
        const blob = await response.blob()
        const reader = new FileReader()
        const dataUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
        const imgProps = doc.getImageProperties(dataUrl)
        const imgHeight = (imgProps.height * 20) / imgProps.width
        doc.addImage(dataUrl, 'PNG', margin, yPos, 20, imgHeight)
        yPos += imgHeight + 5
      } catch (e) {
        console.warn('Não foi possível carregar o logo no PDF:', e)
        // Não quebra a geração, apenas pula o logo
      }
    }
    checkNewPage(30)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(clinic?.name || 'Ficha de Anamnese', margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(fullTemplate.name, margin, yPos) // Usa fullTemplate.name
    yPos += 10

    // --- INFORMAÇÕES DO PACIENTE ---
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Paciente:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(patient?.name || 'Não informado', margin + 20, yPos)
    yPos += 6

    doc.setFont('helvetica', 'bold')
    doc.text('Data Nasc:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formattedBirthDate, margin + 20, yPos)

    doc.setFont('helvetica', 'bold')
    doc.text('CPF:', margin + 60, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(patient?.cpf || 'Não informado', margin + 70, yPos)
    yPos += 6

    doc.setFont('helvetica', 'bold')
    doc.text('Telefone:', margin, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(patient?.phone || 'Não informado', margin + 20, yPos)
    yPos += 10

    // --- LÓGICA DE RENDERIZAÇÃO DE PERGUNTAS ---

    // (Função helper para formatar a resposta)
    function formatAnswerForPDF(answerObj, questionType) {
      if (
        !answerObj ||
        answerObj.answer === null ||
        answerObj.answer === undefined
      ) {
        return 'Não respondido'
      }
      const answer = answerObj.answer

      if (Array.isArray(answer)) {
        if (answer.length === 0) return 'Nenhuma opção selecionada'
        if (questionType === 'multiple_choice') return answer
        return answer.join(', ')
      }
      if (typeof answer === 'boolean') {
        return answer ? 'Sim' : 'Não'
      }
      if (String(answer).trim() === '') {
        return 'Não respondido'
      }
      return String(answer)
    }

    // (Função helper para desenhar a resposta)
    function renderAnswerByType(question, answerObj) {
      const formattedAnswer = formatAnswerForPDF(
        answerObj,
        question.questionType,
      )
      const answerIndent = margin + 5

      switch (question.questionType) {
        case 'long_text':
          checkNewPage(15)
          const textLines = doc.splitTextToSize(formattedAnswer, usableWidth - 5)
          doc.text(textLines, answerIndent, yPos)
          yPos += textLines.length * 5 + 8
          break

        case 'yes_no':
          checkNewPage(15)
          doc.text(
            `( ${formattedAnswer === 'Sim' ? 'X' : ' '} ) Sim`,
            answerIndent,
            yPos,
          )
          doc.text(
            `( ${formattedAnswer === 'Não' ? 'X' : ' '} ) Não`,
            answerIndent + 30,
            yPos,
          )
          yPos += 10
          break

        case 'single_choice':
        case 'multiple_choice':
          const selectedAnswers = Array.isArray(formattedAnswer)
            ? formattedAnswer
            : [formattedAnswer]
          const options = Array.isArray(question.options) ? question.options : []

          checkNewPage(options.length * 6 + 5)
          if (options.length > 0) {
            options.forEach((option) => {
              doc.text(
                `( ${selectedAnswers.includes(option) ? 'X' : ' '} ) ${option}`,
                answerIndent,
                yPos,
              )
              yPos += 6
            })
          } else {
            doc.text(formattedAnswer, answerIndent, yPos)
            yPos += 10
          }
          yPos += 4
          break

        default: // 'text'
          checkNewPage(10)
          doc.text(formattedAnswer, answerIndent, yPos)
          yPos += 10
      }
    }

    // (Função recursiva para renderizar perguntas)
    function renderQuestions(questionsArray, parentNumber = null) {
      if (!questionsArray || questionsArray.length === 0) {
        return
      }

      questionsArray.forEach((question, index) => {
        const questionNumber = parentNumber
          ? `${parentNumber}.${getSubQuestionLetter(index)}`
          : `${index + 1}`

        const answerObj = answersMap[question.qId]

        checkNewPage(10)
        doc.setFont('helvetica', 'bold')
        const titleIndent = parentNumber ? margin + 5 : margin
        const titleLines = doc.splitTextToSize(
          `${questionNumber}. ${question.title}`,
          usableWidth - (parentNumber ? 5 : 0),
        )
        doc.text(titleLines, titleIndent, yPos)
        yPos += titleLines.length * 5 + 2

        doc.setFont('helvetica', 'normal')
        if (answerObj) {
          renderAnswerByType(question, answerObj)
        } else {
          doc.text('Não respondido', margin + 5, yPos)
          yPos += 10
        }

        if (
          question.conditionalQuestions &&
          question.conditionalQuestions.length > 0
        ) {
          const parentAnswer = answerObj ? answerObj.answer : null

          question.conditionalQuestions.forEach((group) => {
            if (parentAnswer === group.showWhenAnswerIs) {
              renderQuestions(group.questions, questionNumber)
            }
          })
        }

        if (!parentNumber) {
          yPos += 5
        }
      })
    }

    // --- Ponto de Entrada da Renderização ---
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 10

    // ✨ 4. Usa o fullTemplate.questions
    renderQuestions(fullTemplate.questions)

    // --- RODAPÉ ---
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      const text = `Página ${i} de ${pageCount} | Gerado em: ${formatSimpleDate(
        new Date(),
      )}`
      doc.text(text, margin, pageHeight - 10)
    }

    // --- RETORNO ---
    const pdfData = doc.output('datauristring')
    const fileName = `Anamnese_${patient.name.replace(
      / /g,
      '_',
    )}_${new Date().toISOString().split('T')[0]}.pdf`

    return {
      fileName: fileName,
      pdfUrl: pdfData,
    }
  } catch (error) {
    // ✨ 5. Pega o erro e o retorna para o componente
    console.error('Erro final ao gerar PDF:', error)
    return { error: error.message || 'Erro desconhecido ao gerar PDF.' }
  }
}

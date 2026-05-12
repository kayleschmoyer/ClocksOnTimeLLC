import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { WaitingListRecord } from '../types'
import { formatDate } from './dateUtils'

export function exportSearchResultsToPDF(
  records: WaitingListRecord[],
  title = 'Clocks on Time LLC — Waiting List'
): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'letter' })

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Clocks on Time LLC', 14, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(title, 14, 20)
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}  |  ${records.length} record${records.length !== 1 ? 's' : ''}`, 14, 26)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 30,
    head: [['#', 'Last Name', 'First Name', 'Date Entered', 'Phone', 'Date Called', 'Clock Type', 'Issue', 'Status']],
    body: records.map(r => [
      r.number,
      r.lastName,
      r.firstName,
      formatDate(r.dateEntered),
      r.phoneNumber,
      formatDate(r.dateCalled),
      r.clockType === 'Other' ? (r.customClockType ?? 'Other') : r.clockType,
      r.issue.length > 50 ? r.issue.slice(0, 47) + '...' : r.issue,
      r.status,
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: [24, 29, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10 },   // #
      1: { cellWidth: 25 },   // Last Name
      2: { cellWidth: 22 },   // First Name
      3: { cellWidth: 22 },   // Date Entered
      4: { cellWidth: 28 },   // Phone
      5: { cellWidth: 22 },   // Date Called
      6: { cellWidth: 25 },   // Clock Type
      7: { cellWidth: 'auto' }, // Issue
      8: { cellWidth: 18 },   // Status
    },
    didDrawPage: (data) => {
      // Footer with page number
      doc.setFontSize(7)
      doc.setTextColor(130)
      doc.text(
        `Page ${data.pageNumber}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: 'center' }
      )
    },
  })

  const filename = `waiting-list-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

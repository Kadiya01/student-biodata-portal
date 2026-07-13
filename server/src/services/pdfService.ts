import PDFDocument from 'pdfkit';
import { Response } from 'express';
import prisma from '../prismaClient';
import logger from '../utils/logger';

export async function buildStudentPdf(studentId: string): Promise<Buffer> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!profile) {
    throw new Error('Student not found');
  }

  const bio = (profile.bio as any) || {};
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  renderBiodata(doc, profile, bio);
  doc.end();

  return done;
}

export async function generateStudentPdf(studentId: string, res: Response): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: true },
  });

  if (!profile) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const bio = (profile.bio as any) || {};
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="biodata-${profile.studentNumber || studentId}.pdf"`
  );
  doc.pipe(res);

  renderBiodata(doc, profile, bio);
  doc.end();
}

function renderBiodata(doc: PDFKit.PDFDocument, profile: any, bio: any): void {
  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('RAUDA COLLEGE OF HEALTH SCIENCE AND TECHNOLOGY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Student Bio-Data Form', { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Student Info
  doc.fontSize(14).font('Helvetica-Bold').text('Personal Information');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');
  const personalFields: [string, string][] = [
    ['Registration Number', profile.studentNumber || 'N/A'],
    ['Full Name', bio.fullName || `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim()],
    ['Email', profile.user.email],
    ['Phone', bio.phone || profile.contactPhone || 'N/A'],
    ['Date of Birth', bio.dob || (profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A')],
    ['Gender', bio.gender || profile.gender || 'N/A'],
    ['Address', bio.address || profile.address || 'N/A'],
    ['Submission Status', profile.status],
  ];

  for (const [label, value] of personalFields) {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value);
  }

  doc.moveDown(0.8);

  // Educational Info
  doc.fontSize(14).font('Helvetica-Bold').text('Educational Information');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');

  const eduFields: [string, string][] = [
    ['Primary School', bio.primarySchool || 'N/A'],
    ['Secondary School', bio.secondarySchool || 'N/A'],
    ['SSCE Type', bio.ssceType || 'N/A'],
  ];

  for (const [label, value] of eduFields) {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value);
  }

  // SSCE Results Table
  doc.moveDown(0.5);
  if (bio.ssceSubjects && bio.ssceSubjects.length > 0) {
    doc.font('Helvetica-Bold').text('SSCE Results:');
    doc.moveDown(0.3);

    const tableTop = doc.y;
    const colWidths = [250, 100, 100];
    const headers = ['Subject', 'Grade', 'Credit'];

    // Table header
    doc.font('Helvetica-Bold').fontSize(10);
    let x = 50;
    headers.forEach((h, i) => {
      doc.text(h, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
    doc.moveDown(0.2);

    // Table rows
    doc.font('Helvetica').fontSize(9);
    for (const subj of bio.ssceSubjects) {
      const grade = subj.grade || '';
      const isCredit = ['A1', 'A2', 'B1', 'B2', 'B3', 'C4', 'C5', 'C6'].includes(grade);
      let rowY = doc.y;
      let rx = 50;
      doc.text(subj.subject || '', rx, rowY, { width: colWidths[0] }); rx += colWidths[0];
      doc.text(grade, rx, rowY, { width: colWidths[1] }); rx += colWidths[1];
      doc.text(isCredit ? 'Yes' : 'No', rx, rowY, { width: colWidths[2] });
      doc.moveDown(0.2);
    }

    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text(`Total Credits: ${bio.creditsCount || 0}`);
    doc.font('Helvetica').text(`Eligible: ${bio.isEligible ? 'Yes' : 'No'}`);
  }

  doc.moveDown(0.8);

  // Guardian Info
  doc.fontSize(14).font('Helvetica-Bold').text('Guardian Information');
  doc.moveDown(0.3);
  doc.fontSize(10).font('Helvetica');

  const guardianFields: [string, string][] = [
    ['Guardian Name', bio.guardianName || 'N/A'],
    ['Guardian Phone', bio.guardianPhone || 'N/A'],
    ['Relationship', bio.guardianRelationship || 'N/A'],
    ['Guardian Address', bio.guardianAddress || 'N/A'],
  ];

  for (const [label, value] of guardianFields) {
    doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
    doc.font('Helvetica').text(value);
  }

  // Footer
  doc.moveDown(2);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica').text(
    `Generated on ${new Date().toLocaleDateString()} | Student Bio-Data System | College of Health Science and Technology`,
    { align: 'center' }
  );
}

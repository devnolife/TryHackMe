/**
 * PDF Report Download API Route
 * Generates and downloads penetration testing reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { ReportGenerator } from '@/lib/report-generation/report-generator';
import { PDFExporter } from '@/lib/report-generation/pdf-exporter';

const prisma = new PrismaClient();

// GET - Download report as HTML/PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = params;
    const format = request.nextUrl.searchParams.get('format') || 'html';

    // Get report from database
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        student: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check authorization - user can only download their own reports unless admin/instructor
    if (
      authResult.user.role === 'STUDENT' &&
      report.studentId !== authResult.user.id
    ) {
      return NextResponse.json(
        { error: 'Forbidden - You can only download your own reports' },
        { status: 403 }
      );
    }

    // Parse the stored content
    const content = typeof report.content === 'string'
      ? JSON.parse(report.content)
      : report.content;

    // Build ReportData from stored content
    const reportData = {
      title: report.title,
      studentName: report.student.fullName,
      studentId: report.student.studentId || report.student.id,
      labTitle: content.labTitle || 'Lab Session',
      sessionNumber: content.sessionNumber || 1,
      generatedAt: report.generatedAt,
      executiveSummary: content.executiveSummary || '',
      methodology: content.methodology || 'Standard penetration testing methodology following industry best practices.',
      scope: content.scope || 'As defined in the lab scenario.',
      findings: content.findings || [],
      vulnerabilities: content.vulnerabilities || [],
      recommendations: content.recommendations || [],
      conclusion: content.conclusion || 'Assessment completed successfully.',
      appendices: content.appendices || [],
    };

    // Generate HTML
    const exportOptions = {
      includeAppendices: true,
      includeCharts: false,
      confidentialityLevel: 'INTERNAL' as const,
    };

    if (format === 'print' || format === 'pdf') {
      // Generate print-ready HTML that can be saved as PDF via browser
      const html = PDFExporter.generatePrintableReport(reportData, exportOptions);

      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="PenTest_Report_${report.id}.html"`,
        },
      });
    }

    // Generate downloadable HTML
    const result = await PDFExporter.exportToDownloadable(reportData, exportOptions);

    return new NextResponse(result.html, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });

  } catch (error) {
    console.error('Report download error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

// POST - Generate a new report
export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reportId } = params;
    const body = await request.json();
    const { sessionId, regenerate } = body;

    // If regenerating existing report
    if (regenerate && reportId !== 'generate') {
      const existingReport = await prisma.report.findUnique({
        where: { id: reportId },
      });

      if (!existingReport) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }

      // Only the owner or admin can regenerate
      if (
        authResult.user.role === 'STUDENT' &&
        existingReport.studentId !== authResult.user.id
      ) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      // Generate new report data
      const reportData = await ReportGenerator.generateReport(
        existingReport.studentId,
        sessionId || (existingReport.content as any)?.sessionId,
        existingReport.type as 'SESSION_REPORT' | 'FINAL_REPORT'
      );

      // Update the report
      const updatedReport = await prisma.report.update({
        where: { id: reportId },
        data: {
          content: reportData as any,
          generatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        report: updatedReport,
      });
    }

    // Generate new report
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await prisma.labSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Lab session not found' },
        { status: 404 }
      );
    }

    // Determine report type
    const reportType = session.sessionNumber === 8 ? 'FINAL_REPORT' : 'SESSION_REPORT';

    // Generate report data
    const reportData = await ReportGenerator.generateReport(
      authResult.user.id,
      sessionId,
      reportType
    );

    // Save to database
    const newReport = await prisma.report.create({
      data: {
        studentId: authResult.user.id,
        title: `${session.title} - Penetration Test Report`,
        type: reportType,
        content: reportData as any,
        status: 'GENERATED',
        generatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      report: newReport,
    });

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

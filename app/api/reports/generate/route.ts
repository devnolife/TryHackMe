import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/middleware';
import { ReportGenerator } from '@/lib/report-generation/report-generator';

// POST /api/reports/generate - Generate a report
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request);

    if (!auth.authenticated || !auth.user) {
      return auth.response;
    }

    const body = await request.json();
    const { sessionId, reportType } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    // Generate report data
    const reportData = await ReportGenerator.generateReport(
      auth.user.userId,
      sessionId,
      reportType || 'SESSION_REPORT'
    );

    // Save report to database
    const report = await prisma.report.create({
      data: {
        studentId: auth.user.userId,
        sessionId,
        reportType: reportType || 'SESSION_REPORT',
        title: reportData.title,
        executiveSummary: reportData.executiveSummary,
        findings: JSON.parse(JSON.stringify(reportData.findings)),
        vulnerabilities: JSON.parse(JSON.stringify(reportData.vulnerabilities)),
        recommendations: JSON.parse(JSON.stringify(reportData.recommendations)),
        conclusion: reportData.conclusion,
      },
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      report: reportData,
      message: 'Report generated successfully',
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Checkbox,
} from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ReportChart } from './report-chart';
import { generateReport } from '@/app/actions/reports';
import { exportReportToPDF } from '@/lib/pdf-export';
import { exportReportToExcel } from '@/lib/excel-export';
import { ReportConfig, ReportData } from '@/lib/types';
import { Loader2, FileJson, Download, DownloadCloud } from 'lucide-react';

const MODULES = [
  { id: 'accounts', label: 'Accounts' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'deals', label: 'Deals' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'projects', label: 'Projects' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'activities', label: 'Activities' },
  { id: 'quotes', label: 'Quotes' },
  { id: 'services', label: 'Services' },
];

export function ReportBuilder() {
  const [selectedModules, setSelectedModules] = useState<string[]>(['accounts', 'deals', 'invoices']);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'comparative' | 'analytical'>('summary');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [consolidated, setConsolidated] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleGenerateReport = () => {
    startTransition(async () => {
      try {
        const config: ReportConfig = {
          modules: selectedModules as any,
          reportType,
          timeframe,
          filters: {
            dateRange: {
              startDate,
              endDate,
            },
            status: [],
          },
          includeGraphs,
          consolidated,
        };

        const data = await generateReport(config);
        setReportData(data);
      } catch (error) {
        console.error('Failed to generate report:', error);
        alert('Failed to generate report. Check console for details.');
      }
    });
  };

  const handleExportPDF = () => {
    if (!reportData) return;

    exportReportToPDF(reportData, {
      format: 'pdf',
      includeGraphs,
      branding: {
        companyName: 'Dynamic CRM',
        companyEmail: 'info@dynamiccrm.com',
        companyPhone: '+1 (555) 123-4567',
      },
    });
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    exportReportToExcel(reportData, {
      format: 'excel',
      includeGraphs,
      branding: {
        companyName: 'Dynamic CRM',
        companyEmail: 'info@dynamiccrm.com',
        companyPhone: '+1 (555) 123-4567',
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select modules and configure report parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Module Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Modules</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {MODULES.map(module => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => handleModuleToggle(module.id)}
                  />
                  <Label htmlFor={module.id} className="cursor-pointer font-normal">
                    {module.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Report Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger id="report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comparative">Comparative</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger id="timeframe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-graphs"
                checked={includeGraphs}
                onCheckedChange={(checked) => setIncludeGraphs(checked as boolean)}
              />
              <Label htmlFor="include-graphs" className="cursor-pointer font-normal">
                Include Graphs and Charts
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="consolidated"
                checked={consolidated}
                onCheckedChange={(checked) => setConsolidated(checked as boolean)}
              />
              <Label htmlFor="consolidated" className="cursor-pointer font-normal">
                Consolidated Report (All Modules Together)
              </Label>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleGenerateReport}
              disabled={selectedModules.length === 0 || isPending}
              className="gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileJson className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>

            {reportData && (
              <>
                <Button
                  onClick={handleExportPDF}
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>

                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="gap-2"
                >
                  <DownloadCloud className="h-4 w-4" />
                  Export Excel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <CardTitle>{reportData.title}</CardTitle>
              <CardDescription>
                Generated on {reportData.generatedAt.toLocaleString()} by {reportData.generatedBy}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Timeframe</Label>
                  <p className="text-lg font-semibold">{reportData.timeframe}</p>
                </div>
                {reportData.consolidated && (
                  <div>
                    <Label className="text-muted-foreground text-sm">Total Records</Label>
                    <p className="text-lg font-semibold">{reportData.consolidated.totalRecords}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Module Reports */}
          {reportData.modules.map((module, index) => (
            <div key={index} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{module.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Label className="text-muted-foreground text-sm">Total Records</Label>
                      <p className="text-2xl font-bold text-blue-600">{module.summary.totalRecords}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Label className="text-muted-foreground text-sm">Active</Label>
                      <p className="text-2xl font-bold text-green-600">{module.summary.activeRecords}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <Label className="text-muted-foreground text-sm">Completed</Label>
                      <p className="text-2xl font-bold text-amber-600">{module.summary.completedRecords}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Label className="text-muted-foreground text-sm">Pending</Label>
                      <p className="text-2xl font-bold text-purple-600">{module.summary.pendingRecords}</p>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  {Object.keys(module.summary.metrics).length > 0 && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Metrics</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(module.summary.metrics).map(([key, value]) => (
                          <div key={key} className="bg-gray-50 p-3 rounded">
                            <Label className="text-muted-foreground text-sm">{key}</Label>
                            <p className="text-lg font-semibold">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts */}
                  {module.graphs && module.graphs.length > 0 && (
                    <div>
                      <Label className="text-base font-semibold mb-4 block">Charts & Visualizations</Label>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {module.graphs.map((graph, graphIndex) => (
                          <ReportChart
                            key={graphIndex}
                            title={graph.title}
                            type={graph.type as 'bar' | 'line' | 'pie'}
                            data={graph.data}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!reportData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileJson className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Report Generated</h3>
            <p className="text-muted-foreground text-center">
              Configure your report parameters and click "Generate Report" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

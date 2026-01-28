'use server';

import { getDb } from '@/lib/mongodb';
import { ReportConfig, ReportData } from '@/lib/types';
import { getAccounts } from './accounts';
import { getContacts } from './contacts';
import { getDeals } from './deals';
import { getInvoices } from './invoices';
import { getProjects } from './projects';
import { getTickets } from './tickets';
import { getInventoryItems } from './inventory';
import { getActivities } from './activities';
import { getQuotes } from './quotes';
import { getServices } from './services';

interface ModuleDataFetcher {
  [key: string]: () => Promise<any[]>;
}

const moduleFetchers: ModuleDataFetcher = {
  accounts: getAccounts,
  contacts: getContacts,
  deals: getDeals,
  invoices: getInvoices,
  projects: getProjects,
  tickets: getTickets,
  inventory: getInventoryItems,
  activities: getActivities,
  quotes: getQuotes,
  services: getServices,
};

function filterDataByDateRange(data: any[], startDate: string, endDate: string): any[] {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return data.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= start && itemDate <= end;
  });
}

function filterDataByStatus(data: any[], statuses: string[]): any[] {
  return data.filter(item => item.status && statuses.includes(item.status));
}

function generateModuleSummary(data: any[]) {
  const activeRecords = data.filter(item => item.status === 'Active' || item.status === 'Paid' || item.status === 'In Progress').length;
  const completedRecords = data.filter(item => item.status === 'Completed' || item.status === 'Closed' || item.status === 'Resolved').length;
  const pendingRecords = data.filter(item => item.status === 'Draft' || item.status === 'Open' || item.status === 'Pending').length;

  // Calculate module-specific metrics
  const metrics: Record<string, number | string> = {};

  // Detect module type and calculate appropriate metrics
  if (data.length > 0) {
    const sample = data[0];
    if (sample.totalAmount !== undefined) {
      metrics.totalAmount = data.reduce((sum: number, item: any) => sum + (item.totalAmount || 0), 0);
    }
    if (sample.amount !== undefined && typeof sample.amount === 'string') {
      const total = data.reduce((sum: number, item: any) => {
        const amount = parseFloat(item.amount?.replace(/[$,]/g, '') || '0');
        return sum + amount;
      }, 0);
      metrics.totalAmount = total;
    }
    if (sample.quantity !== undefined) {
      metrics.totalQuantity = data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    if (sample.budget !== undefined) {
      metrics.totalBudget = data.reduce((sum: number, item: any) => sum + (item.budget || 0), 0);
      metrics.totalActualCost = data.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0);
    }
  }

  return {
    totalRecords: data.length,
    activeRecords,
    completedRecords,
    pendingRecords,
    metrics,
  };
}

function generateGraphData(data: any[], moduleName: string) {
  const graphs = [];

  // Status distribution pie chart
  const statusCounts: Record<string, number> = {};
  data.forEach((item: any) => {
    const status = item.status || 'Unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  if (Object.keys(statusCounts).length > 0) {
    graphs.push({
      type: 'pie',
      title: `${moduleName} Status Distribution`,
      data: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: 'Count',
            data: Object.values(statusCounts),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
          },
        ],
      },
    });
  }

  // Monthly trend line chart
  const monthlyData: Record<string, number> = {};
  data.forEach((item: any) => {
    if (item.createdAt) {
      const date = new Date(item.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    }
  });

  if (Object.keys(monthlyData).length > 0) {
    graphs.push({
      type: 'line',
      title: `${moduleName} Monthly Trend`,
      data: {
        labels: Object.keys(monthlyData),
        datasets: [
          {
            label: 'Records Created',
            data: Object.values(monthlyData),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
          },
        ],
      },
    });
  }

  // Financial data for modules that have amounts
  if (data.length > 0 && data[0].totalAmount !== undefined) {
    const byStatus: Record<string, number> = {};
    data.forEach((item: any) => {
      const status = item.status || 'Unknown';
      byStatus[status] = (byStatus[status] || 0) + (item.totalAmount || 0);
    });

    if (Object.keys(byStatus).length > 0) {
      graphs.push({
        type: 'bar',
        title: `${moduleName} Revenue by Status`,
        data: {
          labels: Object.keys(byStatus),
          datasets: [
            {
              label: 'Amount',
              data: Object.values(byStatus),
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            },
          ],
        },
      });
    }
  }

  return graphs;
}

export async function generateReport(config: ReportConfig): Promise<ReportData> {
  try {
    const reportModules = [];
    let consolidatedBreakdown: Record<string, number> = {};

    // Fetch data for selected modules
    for (const moduleName of config.modules) {
      const fetcher = moduleFetchers[moduleName];
      if (!fetcher) continue;

      let data = await fetcher();

      // Apply filters
      data = filterDataByDateRange(
        data,
        config.filters.dateRange.startDate,
        config.filters.dateRange.endDate
      );

      if (config.filters.status && config.filters.status.length > 0) {
        data = filterDataByStatus(data, config.filters.status);
      }

      const summary = generateModuleSummary(data);
      const graphs = config.includeGraphs ? generateGraphData(data, moduleName) : [];

      reportModules.push({
        name: moduleName.charAt(0).toUpperCase() + moduleName.slice(1),
        data: config.reportType === 'summary' ? [] : data,
        summary,
        graphs: config.includeGraphs ? graphs : undefined,
      });

      consolidatedBreakdown[moduleName] = data.length;
    }

    const reportData: ReportData = {
      title: `${config.reportType.charAt(0).toUpperCase() + config.reportType.slice(1)} Report - ${config.timeframe}`,
      generatedAt: new Date(),
      generatedBy: 'Admin User',
      timeframe: `${config.filters.dateRange.startDate} to ${config.filters.dateRange.endDate}`,
      modules: reportModules,
      filters: config.filters,
      consolidated: config.consolidated
        ? {
            totalRecords: reportModules.reduce((sum, m) => sum + m.summary.totalRecords, 0),
            breakdown: consolidatedBreakdown,
          }
        : undefined,
    };

    return reportData;
  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
}

export async function getReportSchedules() {
  try {
    const db = await getDb();
    const schedules = await db
      .collection('reportSchedules')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return JSON.parse(JSON.stringify(schedules));
  } catch (error) {
    console.error('Failed to fetch report schedules:', error);
    return [];
  }
}

export async function createReportSchedule(schedule: any) {
  try {
    const db = await getDb();
    const scheduleData = {
      ...schedule,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection('reportSchedules').insertOne(scheduleData);
    return { success: true, message: 'Report schedule created successfully.' };
  } catch (error) {
    console.error('Failed to create report schedule:', error);
    return { success: false, message: 'Failed to create report schedule.' };
  }
}

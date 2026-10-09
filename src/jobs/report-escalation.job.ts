import cron from 'node-cron';
import { env } from '../config/env.js';
import { Report } from '../models/report.model.js';
import { emitReportUpdated } from '../realtime/socket.js';

export async function escalateOldReports(): Promise<number> {
  // Calcula el threshold usando REPORT_ESCALATION_MINUTES. Después consulta los
  // Reports OPEN creados antes o en ese threshold. Por cada Report, cambia el
  // status a ESCALATED, guarda el cambio y emite report:updated con el helper
  // existente. La función debe regresar el número de Reports escalados.
  const threshold = new Date(
    Date.now() - env.reportEscalationMinutes * 60_000
  );

  const reports = await Report.find({
    status: 'OPEN',
    createdAt: { $lte: threshold }
  }).populate('channelId', 'name');

  for (const report of reports) {
    report.status = 'ESCALATED';
    await report.save();

    emitReportUpdated(
      report.userId.toString(),
      report.toObject()
    );
  }

  return reports.length;
}

export function startReportEscalationJob(): void {
  // Programa la ejecución periódica de escalateOldReports() usando node-cron y
  // env.reportEscalationCron. Controla los errores para que una falla del job
  // no detenga el servidor.
  cron.schedule(env.reportEscalationCron, async () => {
    try {
      await escalateOldReports();
    } catch (error) {
      console.error("Could not escalate old reports:", error);
    }
  });
}

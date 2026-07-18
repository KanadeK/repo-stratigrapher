import initSqlJs, { type Database } from "sql.js";
import type { StratigraphyReport } from "../core/types";

type SqlJsExecResult = {
  values: unknown[][];
};

export async function createReportCache(
  report: StratigraphyReport,
): Promise<Uint8Array> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  migrate(db);
  const insert = db.prepare(
    "INSERT INTO reports (generated_at, repository_root, payload) VALUES (?, ?, ?)",
  );
  insert.run([
    report.generatedAt,
    report.repositoryRoot,
    JSON.stringify(report),
  ]);
  insert.free();
  const bytes = db.export();
  db.close();
  return bytes;
}

export async function readReportCache(
  bytes: Uint8Array,
): Promise<StratigraphyReport[]> {
  const SQL = await initSqlJs();
  const db = new SQL.Database(bytes);
  const rows = db.exec(
    "SELECT payload FROM reports ORDER BY generated_at DESC",
  ) as SqlJsExecResult[];
  db.close();
  return rows.flatMap((row: SqlJsExecResult) =>
    row.values.map(
      ([payload]: unknown[]) =>
        JSON.parse(String(payload)) as StratigraphyReport,
    ),
  );
}

function migrate(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      generated_at TEXT NOT NULL,
      repository_root TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
}

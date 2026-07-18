declare module "sql.js" {
  export type Database = {
    run(sql: string): void;
    prepare(sql: string): {
      run(values: unknown[]): void;
      free(): void;
    };
    exec(sql: string): unknown[];
    export(): Uint8Array;
    close(): void;
  };

  export default function initSqlJs(): Promise<{
    Database: new (bytes?: Uint8Array) => Database;
  }>;
}

import { dbFactory } from "@/db/dbFactory";

export const [testDb] = dbFactory(
  import.meta.env.VITE_CI
    ? {
        type: "aws",
        database: import.meta.env.VITE_DB_NAME!,
        secretArn: import.meta.env.VITE_DB_SECRET_ARN!,
        resourceArn: import.meta.env.VITE_DB_CLUSTER_ARN!,
      }
    : {
        type: "node",
        connectionString: import.meta.env.VITE_DB_URL!,
      },
);

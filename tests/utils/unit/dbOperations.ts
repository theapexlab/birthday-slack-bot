import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: "eu-central-1" });

const executeSql = async (sql: string) => {
  // console.log("🚀 ~ executeSql ~ sql:", sql);
  const res = await client.send(
    new InvokeCommand({
      FunctionName: process.env.VITE_DB_FUNCTION_NAME,
      Payload: JSON.stringify({
        sql,
      }),
    }),
  );

  const payload = res.Payload
    ? Buffer.from(res.Payload?.buffer).toString()
    : undefined;
  const parsedPayload = JSON.parse(payload);
  // console.log(
  //   "🚀 ~ executeSql ~ responsePayload:",
  //   JSON.parse(parsedPayload.body),
  // );
  return JSON.parse(parsedPayload.body);
};

export const cleanUp = async (tableName: string) =>
  executeSql(`Delete from ${tableName}`);

export const generateInsertQuery = (tableName, values) => {
  // Ensure values is always an array to simplify processing
  if (!Array.isArray(values)) {
    values = [values];
  }

  const columns = Object.keys(values[0]).join(", ");
  // Serialize each row's values and include them directly in the query
  const rowsData = values
    .map((item) => {
      const rowData = Object.values(item)
        .map((value) => {
          if (typeof value === "string") {
            // Escape single quotes in strings
            return `'${value.replace(/'/g, "''")}'`;
          } else if (value instanceof Date) {
            // Format dates as ISO strings
            return `'${value.toISOString()}'`;
          } else {
            return value;
          }
        })
        .join(", ");

      return `(${rowData})`;
    })
    .join(", ");

  return `INSERT INTO ${tableName} (${columns}) VALUES ${rowsData};`;
};

export const insertDb = async (tableName, values) =>
  executeSql(generateInsertQuery(tableName, values));

const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

export const queryDb = async (query) => {
  const res = await executeSql(query);
  const formattedRows = res.rows.map((row) => {
    const newRow = {};
    Object.keys(row).forEach((key) => {
      newRow[toCamelCase(key)] = row[key];
    });
    return newRow;
  });
  return formattedRows;
};

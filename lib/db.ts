import { Pool } from "pg";

// Initialize a connection pool for PostgreSQL
const pool = new Pool({
  connectionString:
    "postgresql://default:FvlS8zd0uebQ@ep-dawn-salad-a4hqsmyk-pooler.us-east-1.aws.neon.tech/lms?sslmode=require",
});

export async function query({
  query,
  values = [],
}: {
  query: string;
  values: any[]; // Updated to accept any type of values
}) {
  const client = await pool.connect(); // Get a client from the pool
  // console.log(client);
  try {
    // Log the query and its values
    console.log("Executing query:", query);
    console.log("With values:", values);
    const res = await client.query(query, values);
    return res.rows; // Return the rows from the query result
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    client.release(); // Release the client back to the pool
  }
}

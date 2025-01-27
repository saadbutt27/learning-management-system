import { Pool, QueryResultRow } from "pg";

// Initialize a connection pool for PostgreSQL
const pool = new Pool({
  connectionString:
    process.env.DB_URL,
});

// Define the query function
export async function query<T extends QueryResultRow>({
  query,
  values = [],
}: {
  query: string;
  values: unknown[]; // Accept any type of values
}): Promise<T[]> {
  const client = await pool.connect(); // Get a client from the pool

  try {
    // Log the query and its values
    console.log("Executing query:", query);
    console.log("With values:", values);

    // Execute the query
    const res = await client.query<T>(query, values);
    return res.rows; // Return the rows from the query result
  } catch (error) {
    // Log and throw a custom error
    console.error("Error executing query:", error);
    throw new Error(`Database query failed: ${error}`);
  } finally {
    // Always release the client back to the pool
    client.release();
  }
}

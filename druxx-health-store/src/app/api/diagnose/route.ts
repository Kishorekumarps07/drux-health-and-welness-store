import { NextResponse } from "next/server";
import axios from "axios";

export const revalidate = 0; // Disable caching for diagnostics

export async function GET() {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Resolve base URL just like api.ts does
  let baseUrl = envApiUrl || "http://localhost:5001/api/v1";
  if (baseUrl && !baseUrl.includes("/api/v1")) {
    baseUrl = baseUrl.endsWith("/") ? `${baseUrl}api/v1` : `${baseUrl}/api/v1`;
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_API_URL: envApiUrl || "NOT_SET",
      NODE_ENV: process.env.NODE_ENV || "NOT_SET",
      resolvedBaseUrl: baseUrl
    },
    tests: {}
  };

  // Test 1: Fetch from resolvedBaseUrl/db-test
  try {
    const res = await axios.get(`${baseUrl}/db-test`, { timeout: 5000 });
    results.tests.dbTest = {
      status: "success",
      statusCode: res.status,
      data: res.data
    };
  } catch (err: any) {
    results.tests.dbTest = {
      status: "error",
      message: err.message,
      code: err.code,
      response: err.response ? {
        status: err.response.status,
        data: err.response.data
      } : null
    };
  }

  // Test 2: Fetch from hardcoded https://api.drux.in/api/v1/db-test
  try {
    const res = await axios.get(`https://api.drux.in/api/v1/db-test`, { timeout: 5000 });
    results.tests.hardcodedDbTest = {
      status: "success",
      statusCode: res.status,
      data: res.data
    };
  } catch (err: any) {
    results.tests.hardcodedDbTest = {
      status: "error",
      message: err.message,
      code: err.code
    };
  }

  return NextResponse.json(results);
}

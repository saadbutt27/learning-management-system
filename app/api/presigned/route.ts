// File: app/api/presigned/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export async function GET(request: NextRequest) {
  const accessKeyId = process.env.AWS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!accessKeyId || !secretAccessKey || !s3BucketName) {
    return new Response(null, { status: 500 });
  }
  const searchParams = request.nextUrl.searchParams;
  const fileName = searchParams.get("fileName");
  const contentType = searchParams.get("contentType");
  if (!fileName || !contentType) {
    return new Response(null, { status: 500 });
  }
  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: fileName,
    ContentType: contentType,
  });
  const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  if (signedUrl) return NextResponse.json({ signedUrl });
  return new Response(null, { status: 500 });
}

export async function DELETE(request: NextRequest) {
  const accessKeyId = process.env.AWS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const s3BucketName = process.env.AWS_S3_BUCKET_NAME;

  // Ensure all necessary environment variables are set
  if (!accessKeyId || !secretAccessKey || !s3BucketName) {
    return new Response(null, { status: 500 });
  }

  // Get the file name from query parameters
  const searchParams = request.nextUrl.searchParams;
  const fileName = searchParams.get("fileName");

  // Validate the file name
  if (!fileName) {
    return new Response(JSON.stringify({ error: "File name is required" }), {
      status: 400,
    });
  }

  // Initialize S3 client
  const client = new S3Client({
    region: "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // Create the DeleteObjectCommand
  const command = new DeleteObjectCommand({
    Bucket: s3BucketName,
    Key: fileName,
  });

  try {
    // Execute the command
    await client.send(command);

    // Respond with success
    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to delete file",
        details: error,
      }),
      { status: 500 }
    );
  }
}

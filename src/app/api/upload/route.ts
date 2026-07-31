import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

// Inisialisasi S3 Client untuk Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file yang diupload" },
        { status: 400 }
      );
    }

    // Ubah file menjadi buffer agar bisa dikirim ke S3/R2
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Buat nama file yang unik agar tidak ada bentrok jika nama file sama
    // Menggunakan crypto.randomUUID() bawaan Node.js
    const uniqueId = crypto.randomUUID();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, ""); // Bersihkan karakter aneh
    const finalFileName = `${uniqueId}-${cleanFileName}`;

    // Kirim file ke Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: finalFileName,
        Body: buffer,
        ContentType: file.type, // Penting agar gambar dirender di browser, bukan di-download otomatis
      })
    );

    // Buat URL publik untuk disimpan ke database atau dirender di Tiptap
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${finalFileName}`;

    // Kembalikan URL ke frontend
    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("Error uploading to R2:", error);
    return NextResponse.json(
      { error: "Gagal mengupload gambar ke server" },
      { status: 500 }
    );
  }
}
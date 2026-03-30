import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, s3BucketName } from "../lib/s3";

export async function uploadFileToS3(file: File, codigoUnico: string) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let carpeta = "";

  if (["pdf", "doc", "docx"].includes(extension!)) {
    carpeta = "docs";
  } else if (["ppt", "pptx"].includes(extension!)) {
    carpeta = "slides";
  } else {
    throw new Error("Formato no permitido. Solo documentos o presentaciones.");
  }

  const fileKey = `${carpeta}/${codigoUnico}.${extension}`;

  // Convertimos el archivo web a Buffer para S3
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
  });

  await s3Client.send(command);

  // Retornamos la ruta relativa para guardarla en tu BD con Prisma
  return fileKey;
}

/**
 * Elimina un archivo de S3 usando su ruta (Key)
 */
export async function deleteFileFromS3(fileKey: string) {
  const command = new DeleteObjectCommand({
    Bucket: s3BucketName,
    Key: fileKey,
  });

  await s3Client.send(command);
  return true;
}

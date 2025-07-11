import { supabaseClient } from "@/lib/supabaseClient";

// Sanitize filename for Supabase Storage (remove special characters, spaces, etc.)
function sanitizeFileName(fileName: string): string {
  // Remove file extension first
  const lastDotIndex = fileName.lastIndexOf('.');
  const name = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  
  // Sanitize the name part: replace spaces and special chars with underscores
  const sanitizedName = name
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace any non-alphanumeric chars with underscore
    .replace(/_+/g, '_') // Replace multiple consecutive underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  // Return sanitized name with original extension
  return sanitizedName + extension;
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const sanitizedFileName = sanitizeFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
  const { error } = await supabaseClient.storage
    .from("profile-photos")
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  const { data } = supabaseClient.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    console.error("Failed to get public URL for uploaded file", data);
    throw new Error("Failed to get public URL for uploaded file");
  }

  return data.publicUrl;
}

// Teaching Certificates
export async function uploadCertificateFile(file: File, userId: string): Promise<string> {
  const sanitizedFileName = sanitizeFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
  
  console.log("Attempting to upload certificate file:", {
    bucket: "tutor-certificates",
    filePath,
    originalFileName: file.name,
    sanitizedFileName,
    fileSize: file.size,
    fileType: file.type,
    userId
  });
  
  const { error } = await supabaseClient.storage
    .from("tutor-certificates")
    .upload(filePath, file, { upsert: true });
    
  if (error) {
    console.error("Supabase upload error (certificate):", {
      error,
      errorMessage: error.message,
      bucket: "tutor-certificates",
      filePath,
      originalFileName: file.name,
      sanitizedFileName
    });
    throw error;
  }
  
  const { data } = supabaseClient.storage
    .from("tutor-certificates")
    .getPublicUrl(filePath);
    
  if (!data?.publicUrl) {
    console.error("Failed to get public URL for uploaded certificate", data);
    throw new Error("Failed to get public URL for uploaded certificate");
  }
  
  console.log("Certificate uploaded successfully:", data.publicUrl);
  return data.publicUrl;
}

// Teaching Experience Screenshot
export async function uploadTeachingScreenshot(file: File, userId: string): Promise<string> {
  const sanitizedFileName = sanitizeFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
  
  console.log("Attempting to upload teaching screenshot:", {
    bucket: "teaching-screenshots",
    filePath,
    originalFileName: file.name,
    sanitizedFileName,
    fileSize: file.size,
    fileType: file.type,
    userId
  });
  
  const { error } = await supabaseClient.storage
    .from("teaching-screenshots")
    .upload(filePath, file, { upsert: true });
    
  if (error) {
    console.error("Supabase upload error (screenshot):", {
      error,
      errorMessage: error.message,
      bucket: "teaching-screenshots",
      filePath,
      originalFileName: file.name,
      sanitizedFileName
    });
    throw error;
  }
  
  const { data } = supabaseClient.storage
    .from("teaching-screenshots")
    .getPublicUrl(filePath);
    
  if (!data?.publicUrl) {
    console.error("Failed to get public URL for uploaded screenshot", data);
    throw new Error("Failed to get public URL for uploaded screenshot");
  }
  
  console.log("Screenshot uploaded successfully:", data.publicUrl);
  return data.publicUrl;
}

// Demo Video
export async function uploadDemoVideo(file: File, userId: string) {
  if (!userId) throw new Error("User ID is required for video upload");
  const sanitizedFileName = sanitizeFileName(file.name);
  const filePath = `${userId}/${Date.now()}-${sanitizedFileName}`;
  const { error } = await supabaseClient.storage
    .from("demo-videos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
  if (error) throw error;

  // Always return a signed URL for playback (valid for 1 hour)
  const { data, error: urlError } = await supabaseClient.storage
    .from("demo-videos")
    .createSignedUrl(filePath, 60 * 60);
  if (urlError) throw urlError;
  return data.signedUrl;
} 
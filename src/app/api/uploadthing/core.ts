import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Upload endpoint for highlight videos
  highlightVideoUploader: f({
    video: { maxFileSize: "128MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      // You can add authentication here if needed
      return { userId: "user" }; // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log(
        "Highlight video upload complete for userId:",
        metadata.userId
      );
      console.log("File URL:", file.url);

      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Upload endpoint for gingado videos
  gingadoVideoUploader: f({ video: { maxFileSize: "128MB", maxFileCount: 1 } })
    .middleware(async () => {
      // This code runs on your server before upload
      return { userId: "user" }; // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Gingado video upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),

  // Upload endpoint for profile pictures
  profilePictureUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // This code runs on your server before upload
      return { userId: "user" }; // Whatever is returned here is accessible in onUploadComplete as `metadata`
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log(
        "Profile picture upload complete for userId:",
        metadata.userId
      );
      console.log("File URL:", file.url);

      // Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, fileUrl: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

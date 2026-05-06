"use client";

import { useState } from "react";
import { Upload, Copy, Check, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import api from "@/lib/api";

export default function MediaManagerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setUploadedUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status === "success") {
        setUploadedUrl(response.data.data.url);
        toast.success("Upload Successful", {
          description: "Image has been uploaded to Cloudinary.",
        });
      }
    } catch (error: any) {
      toast.error("Upload Failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard!");
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Media Manager</h1>
        <p className="text-gray-500">Upload images manually to Cloudinary and get permanent URLs for your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card className="border-2 border-dashed border-gray-200 shadow-none hover:border-[#A6D608] transition-colors">
          <CardHeader>
            <CardTitle className="text-lg">Upload New Image</CardTitle>
            <CardDescription>Select an image to host on Cloudinary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!preview ? (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                <Upload className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-sm text-gray-400 mb-4">Drag and drop or click to browse</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="media-upload"
                  onChange={handleFileChange}
                />
                <Button asChild variant="outline" className="rounded-xl">
                  <label htmlFor="media-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full h-12 rounded-xl bg-[#A6D608] text-[#1E1E1E] font-bold hover:bg-[#95c207]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading to Cloudinary...
                    </>
                  ) : (
                    "Upload to Cloudinary"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card className="border-none shadow-xl bg-gray-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Cloudinary Result</CardTitle>
            <CardDescription>Copy this URL to use in CMS or products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {uploadedUrl ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure URL</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 text-[#A6D608] hover:text-[#95c207] hover:bg-[#A6D608]/5"
                    >
                      {copied ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                      {copied ? "Copied" : "Copy URL"}
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg break-all text-xs font-mono text-gray-600 border border-gray-100">
                    {uploadedUrl}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Preview</span>
                  <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
                    <img src={uploadedUrl} alt="Live" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ImageIcon className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-gray-400 text-sm max-w-[200px]">Upload an image to see the Cloudinary link here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

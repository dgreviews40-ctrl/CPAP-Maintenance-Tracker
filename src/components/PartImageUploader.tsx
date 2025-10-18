"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Link, Loader2, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { useCustomPartImages } from "@/hooks/use-custom-part-images";
import { isValidUrl } from "@/lib/utils";

interface PartImageUploaderProps {
  uniqueKey: string;
  currentImageUrl?: string;
  onImageUpdated: () => void;
}

const PartImageUploader = ({ uniqueKey, currentImageUrl, onImageUpdated }: PartImageUploaderProps) => {
  const { user } = useAuth();
  const { updateImage } = useCustomPartImages();
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      showError("You must be logged in to upload images.");
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Define the path in storage: user_id/unique_key_hash.ext
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${uniqueKey.replace(/\|/g, '_')}.${fileExt}`;

    try {
      // 1. Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('part-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite existing file
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('part-images')
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) throw new Error("Failed to retrieve public URL.");

      // 3. Save the public URL to the database
      const success = await updateImage(uniqueKey, publicUrlData.publicUrl);
      
      if (success) {
        onImageUpdated();
      }

    } catch (error) {
      console.error("Upload or save error:", error);
      showError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
    }
  };
  
  const handleUrlSave = async () => {
    if (!user) {
      showError("You must be logged in to save image URLs.");
      return;
    }
    if (!isValidUrl(urlInput)) {
      showError("Please enter a valid URL.");
      return;
    }
    
    setIsUploading(true);
    const success = await updateImage(uniqueKey, urlInput);
    if (success) {
      onImageUpdated();
      setUrlInput("");
    }
    setIsUploading(false);
  };
  
  const handleResetImage = async () => {
    if (!window.confirm("Are you sure you want to reset the custom image? This will revert to the default placeholder.")) return;
    
    setIsUploading(true);
    const success = await updateImage(uniqueKey, null);
    if (success) {
      onImageUpdated();
    }
    setIsUploading(false);
  };

  const isCustomImage = currentImageUrl && currentImageUrl !== '/placeholder.svg';

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Upload className="h-4 w-4 mr-2" /> Custom Image Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {isCustomImage && (
          <div className="flex justify-between items-center p-3 border rounded-lg bg-green-500/10">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Custom image is currently active.
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetImage} 
              disabled={isUploading}
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset to Default
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Image File (JPG, PNG)</Label>
          <Input 
            id="file-upload" 
            type="file" 
            accept="image/png, image/jpeg"
            onChange={handleFileUpload}
            ref={fileInputRef}
            disabled={isUploading}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-grow space-y-2">
            <Label htmlFor="url-input">Or Paste Image URL</Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com/my-part.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isUploading}
            />
          </div>
          <Button 
            onClick={handleUrlSave} 
            disabled={!urlInput || !isValidUrl(urlInput) || isUploading}
            className="mt-6"
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
          </Button>
        </div>
        
        {isUploading && (
          <div className="flex items-center text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing image...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartImageUploader;
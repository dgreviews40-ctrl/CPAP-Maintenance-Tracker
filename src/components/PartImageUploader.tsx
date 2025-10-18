"use client";

import React, { useState, useRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Link as LinkIcon, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/utils/toast";
import { useCustomPartImages } from "@/hooks/use-custom-part-images";
import { isValidUrl } from "@/lib/utils";

interface PartImageUploaderProps {
  uniqueKey: string;
  currentImageUrl?: string;
  onImageUpdated: () => void;
  // New prop for handling file upload triggered externally
  onFileUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const PartImageUploader = ({ uniqueKey, currentImageUrl, onImageUpdated, onFileUpload, isUploading }: PartImageUploaderProps) => {
  const { user } = useAuth();
  const { updateImage } = useCustomPartImages();
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null); // Still needed for manual trigger button

  const handleUrlSave = async () => {
    if (!user) {
      showError("You must be logged in to save image URLs.");
      return;
    }
    if (!isValidUrl(urlInput)) {
      showError("Please enter a valid URL.");
      return;
    }
    
    // Use the updateImage mutation directly
    const success = await updateImage(uniqueKey, urlInput);
    if (success) {
      onImageUpdated();
      setUrlInput("");
    }
  };
  
  const handleResetImage = async () => {
    if (!window.confirm("Are you sure you want to reset the custom image? This will revert to the default placeholder.")) return;
    
    // Use the updateImage mutation directly
    const success = await updateImage(uniqueKey, null);
    if (success) {
      onImageUpdated();
    }
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
          <Label htmlFor="file-upload-button">Upload Image File (JPG, PNG)</Label>
          {/* Hidden input is now in PartDetailView, this button triggers that input via ref */}
          <Button 
            id="file-upload-button"
            onClick={() => fileInputRef.current?.click()} 
            variant="outline" 
            className="w-full"
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" /> Select File or Take Photo
          </Button>
          {/* We still need a hidden input here to handle the file selection from this button */}
          <Input 
            id="file-upload-internal" 
            type="file" 
            accept="image/png, image/jpeg"
            capture="environment" // Added capture attribute
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onFileUpload(file);
              }
              e.target.value = ''; // Clear input
            }}
            ref={fileInputRef}
            disabled={isUploading}
            className="hidden"
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
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
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
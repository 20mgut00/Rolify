import { Upload, X, Loader2, AlertCircle, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { avatarAPI } from "../../services/api";
import { getAvatarUrl } from "../../utils/avatarUrl";

interface ImageSelectorProps {
  value?: string;
  onChange?: (imageUrl: string) => void;
  defaultImage?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  width?: string;
  height?: string;
}

export default function ImageSelector({
  value = "",
  onChange,
  defaultImage,
  maxSizeInMB = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  width = "w-96",
  height = "h-96",
}: ImageSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const formatsList = useMemo(
    () => acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", "),
    [acceptedFormats]
  );

  // Determine what image to display
  const displayImage = value || defaultImage || "";
  const resolvedUrl = displayImage ? getAvatarUrl(displayImage) : "";
  const hasCustomImage = !!value && value !== defaultImage;

  const uploadFile = async (file: File) => {
    setError("");
    setIsLoading(true);

    try {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        throw new Error(`Invalid file format. Accepted: ${formatsList}`);
      }

      // Validate file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeInMB) {
        throw new Error(
          `File too large. Maximum size: ${maxSizeInMB}MB (current: ${fileSizeInMB.toFixed(2)}MB)`
        );
      }

      // Upload to backend and get URL
      const avatarUrl = await avatarAPI.upload(file);
      onChange?.(avatarUrl);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: uploadFile,
  });

  const dropZoneClasses = useMemo(
    () =>
      `flex flex-col items-center justify-center ${width} ${height} mx-auto border-2 border-dashed rounded-lg cursor-pointer transition ${
        isDragging
          ? "border-accent-gold bg-yellow-50 dark:bg-yellow-900/30"
          : "border-primary-dark hover:bg-gray-50 dark:hover:bg-gray-900/50"
      }`,
    [width, height, isDragging]
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemoveImage = () => {
    onChange?.(defaultImage || "");
    setError("");
  };

  const handleRevertToDefault = () => {
    onChange?.(defaultImage || "");
    setError("");
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-400 rounded-lg text-red-700 text-sm font-medium">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {resolvedUrl ? (
        <div className="relative">
          <img
            src={resolvedUrl}
            alt="Character avatar preview"
            className={`${width} ${height} object-contain rounded-lg mx-auto`}
          />

          {/* Upload new image button (overlay at bottom) */}
          <label className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 border-2 border-accent-gold text-primary-dark px-4 py-2 rounded-lg hover:bg-accent-gold/20 transition shadow-md cursor-pointer">
            <Upload size={16} />
            <span className="text-sm font-medium">
              {hasCustomImage ? "Change image" : "Upload custom"}
            </span>
            <input
              type="file"
              className="hidden"
              accept={acceptedFormats.join(",")}
              onChange={handleImageChange}
              disabled={isLoading}
            />
          </label>

          {/* Revert to default button (only when custom image is set and default exists) */}
          {hasCustomImage && defaultImage && (
            <button
              type="button"
              onClick={handleRevertToDefault}
              className="absolute top-2 left-2 flex items-center gap-1 bg-white border-2 border-primary-dark/30 text-primary-dark p-2 rounded-full hover:bg-gray-100 transition shadow-md"
              title="Revert to class default"
              disabled={isLoading}
            >
              <RotateCcw size={16} />
            </button>
          )}

          {/* Remove image completely (only when no default image) */}
          {!defaultImage && hasCustomImage && (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-white border-2 border-red-500 text-red-600 p-2 rounded-full hover:bg-red-50 transition shadow-md"
              disabled={isLoading}
            >
              <X size={16} />
            </button>
          )}

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <label className={dropZoneClasses} {...dragHandlers}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <Loader2 className="w-10 h-10 mb-3 text-primary-dark animate-spin" />
              <p className="text-sm text-primary-dark">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
              <Upload className="w-10 h-10 mb-3 text-primary-dark" />
              <p className="mb-2 text-sm text-primary-dark">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-primary-dark/60">
                {formatsList} (max {maxSizeInMB}MB)
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept={acceptedFormats.join(",")}
            onChange={handleImageChange}
            disabled={isLoading}
          />
        </label>
      )}
    </div>
  );
}

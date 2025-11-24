"use client"

import { useState, useRef } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  maxSize?: number // in MB
  aspectRatio?: string
}

export function ImageUpload({
  value,
  onChange,
  className,
  placeholder = "Upload an image",
  maxSize = 5,
  aspectRatio = "square"
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClear = () => {
    setPreview(undefined)
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const aspectRatioClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    wide: "aspect-[16/9]"
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileChange(file)
        }}
      />

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className={cn(
              "w-full object-cover rounded-lg border-2 border-gray-200",
              aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses] || "aspect-square"
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            aspectRatioClasses[aspectRatio as keyof typeof aspectRatioClasses] || "aspect-square",
            "flex flex-col items-center justify-center"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
          <p className="text-xs text-gray-400">or drag and drop</p>
          <p className="text-xs text-gray-400 mt-2">Max {maxSize}MB</p>
        </div>
      )}
    </div>
  )
}

interface ImageGalleryUploadProps {
  values?: string[]
  onChange: (values: string[]) => void
  className?: string
  maxImages?: number
  maxSize?: number
}

export function ImageGalleryUpload({
  values = [],
  onChange,
  className,
  maxImages = 10,
  maxSize = 5
}: ImageGalleryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    if (values.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onChange([...values, result])
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    onChange(newValues)
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileChange(file)
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {values.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image}
              alt={`Image ${index + 1}`}
              className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
              onClick={() => handleRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {values.length < maxImages && (
          <div
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500">Add Image</p>
            <p className="text-xs text-gray-400">{values.length}/{maxImages}</p>
          </div>
        )}
      </div>
    </div>
  )
}

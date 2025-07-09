'use client'

import React, { memo, useEffect, useRef, useState, useCallback } from 'react'
import { Input } from '../ui/input';
import { CloudUpload, LoaderCircleIcon, RefreshCcw, TrashIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
// import { set } from 'zod'; // This import seems unused and might cause issues if not installed
import { TextShimmer } from '../ui/text-shimmer';
import { FaFileAlt, FaFileImage } from 'react-icons/fa';

// Define common image extensions
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'tif'];
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'];

function SingleImageUpload({ file, setFile, fileUploadDetails, className }) { // Removed allowedExtensions prop, will use IMAGE_EXTENSIONS directly

    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const xhrRef = useRef(null);
    const fileRef = useRef(file); // Holds the currently processed file for XHR callbacks
    const [previewUrl, setPreviewUrl] = useState(null); // State for image preview URL

    // Update fileRef and previewUrl when the external 'file' prop changes
    useEffect(() => {
        fileRef.current = file;
        if (file && file.file_type && IMAGE_MIME_TYPES.includes(file.file_type)) {
            // If the file is already a File object (e.g., from an initial prop value)
            if (file.file instanceof File) {
                 const url = URL.createObjectURL(file.file);
                 setPreviewUrl(url);
                 return () => URL.revokeObjectURL(url); // Clean up URL
            }
            // If the file is an object with a file_path (e.g., from previous upload)
            else if (file.file_path) {
                setPreviewUrl(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${file.file_cid}`);
            }
        } else {
            setPreviewUrl(null); // Clear preview if not an image or no file
        }
    }, [file]);


    function isValidImageFile(selecetedFile) {
        const extension = selecetedFile.name.split('.').pop()?.toLowerCase();
        const isValidExtension = IMAGE_EXTENSIONS.includes(extension);
        const isImageMimeType = IMAGE_MIME_TYPES.includes(selecetedFile.type);

        if (!isValidExtension || !isImageMimeType) {
            toast.error(`.${extension} is not an allowed image type.`);
            return false;
        }

        if (selecetedFile.size > 1024 * 1024 * 15) {
            toast.error(`File ${selecetedFile.name} is too large (max 15 MB).`);
            return false;
        }

        return true;
    }

    function handleFileChange(e) {
        const selecetedFile = Array.from(e.target.files)[0];

        if (!selecetedFile) {
            toast.info(`No file provided.`);
            return;
        }

        if (!isValidImageFile(selecetedFile)) {
            return;
        }

        const newFile = {
            file: selecetedFile, // Keep the raw File object
            id: Math.random().toString(36).substring(2, 9),
            file_name: selecetedFile.name,
            file_size: selecetedFile.size,
            file_type: selecetedFile.type,
            // local_preview_url: URL.createObjectURL(selecetedFile) // Add local URL for immediate preview
        }
        handleUpload(newFile);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = Array.from(e.dataTransfer.files)[0];

        if (!droppedFile) {
            toast.info(`No file provided.`);
            return;
        }

        if (!isValidImageFile(droppedFile)) {
            return;
        }

        const newFile = {
            file: droppedFile, // Keep the raw File object
            id: Math.random().toString(36).substring(2, 9),
            file_name: droppedFile.name,
            file_size: droppedFile.size,
            file_type: droppedFile.type,
            // local_preview_url: URL.createObjectURL(droppedFile) // Add local URL for immediate preview
        }
        handleUpload(newFile);
    }

    async function deleteFile() {
        console.log("Deleting file:", file)
        setFile({
            ...file,
            loading: true // Indicate deletion is in progress
        })

        // If it's a freshly selected local file (not yet uploaded), just clear it
        if (!file.file_path && file.file instanceof File) {
            setFile(null);
            setPreviewUrl(null); // Clear preview
            toast.success("File removed.");
            return;
        }

        // Otherwise, proceed with API call for uploaded files
        try {
            const result = await fetch(`/api/v1/files?file_path=${file.file_path}&file_id=${file.id}&details=${JSON.stringify(fileUploadDetails)}`, {
                method: 'DELETE',
            });

            if (result.ok) {
                setFile(null);
                setPreviewUrl(null); // Clear preview
                toast.success("File deleted successfully!");
            } else {
                const errorData = await result.json();
                toast.error(`Failed to delete file: ${errorData.message || 'Unknown error'}`);
                setFile({
                    ...file,
                    loading: false,
                    failed: true,
                    message: errorData.message || "Failed to delete file"
                });
            }
        } catch (error) {
            console.error("Delete file API error:", error);
            toast.error("Network error during file deletion.");
            setFile({
                ...file,
                loading: false,
                failed: true,
                message: "Network error during deletion"
            });
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        setIsDragging(true);
    };

    function handleDragLeave(e) {
        e.preventDefault();
        setIsDragging(false);
    };

    const cancelUpload = (id, fileName) => {
        if (xhrRef.current) {
            xhrRef.current.abort();
            xhrRef.current = null
            setUploadProgress(null);
            setFile(null); // Clear the file on cancellation
            setPreviewUrl(null); // Clear preview on cancellation
            toast.info(`Upload of ${fileName} cancelled`);
        }
    };

    // Corrected handleRetryUpload - had duplicate definition and missing newFile
    function handleRetryUpload(fileWrapper) {
        // fileWrapper should already contain the original File object
        const newFileState = {
            ...fileWrapper,
            failed: false,
            message: null,
            // Ensure local_preview_url is maintained if it existed
            // local_preview_url: fileWrapper.local_preview_url || (fileWrapper.file instanceof File ? URL.createObjectURL(fileWrapper.file) : null)
        };
        setFile(newFileState);
        handleUpload(newFileState);
    }

    async function handleUpload(fileWrapper) {
        const { file: actualFile, id } = fileWrapper; // Destructure the actual File object
        const formData = new FormData();
        formData.append('file', actualFile); // Use the actual File object
        formData.append('details', JSON.stringify(fileUploadDetails))

        // Set the file state immediately, including a local preview URL
        const localUrl = URL.createObjectURL(actualFile);
        setPreviewUrl(localUrl); // Set the preview URL for the component
        setFile({ ...fileWrapper, local_preview_url: localUrl }); // Store it in the file state too


        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded * 100) / event.total);
                setUploadProgress({
                    percentComplete,
                    uploadedBytes: event.loaded,
                })
            }
        });

        xhr.addEventListener('error', () => {
            toast.error(`Failed to upload ${fileRef.current?.file_name || actualFile.name}`);

            setFile((prev) => ({
                ...prev, // Use prev state to ensure we modify the latest
                failed: true,
                message: "Failed to upload",
                loading: false, // Ensure loading is false on error
            }));
            setUploadProgress(null);
            xhrRef.current = null;
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.response);

                console.log('Server response:', response);

                const updatedFile = {
                    ...file,
                    id: response.data.id,
                    file_path: response.data.file_path,
                    file_cid: response.data.file_cid,
                    file_type: response.data.file_type,
                    file_name: response.data.file_name,
                };

                setFile(updatedFile);

                // Update previewUrl to the server-hosted URL
                setPreviewUrl(`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${response.data.file_path}`);

                toast.success(`${fileRef.current?.file_name || actualFile.name} uploaded successfully`);
                setUploadProgress(null);
            } else {
                toast.error(`Failed to upload ${fileRef.current?.file_name || actualFile.name}`);

                setFile((prev) => ({
                    ...prev, // Use prev state
                    failed: true,
                    message: "Failed to upload",
                    loading: false, // Ensure loading is false on error
                }));

                setUploadProgress(null);
            }
            xhrRef.current = null;
        });

        xhr.open('POST', '/api/v1/files');
        xhr.send(formData);
    }


    return (
        <div
            className={cn(
                className,
                ""
            )}
        >
            {!file ? ( // Show upload interface when no file is selected
                <div>
                    <div
                        className={`relative border-2 border-dashed p-3 flex gap-4 items-end cursor-pointer rounded-md ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <CloudUpload size={20} className="text-muted-foreground" />
                        <div className='flex gap-1.5 text-foreground'>
                            <p>Drag & drop or</p>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                accept={IMAGE_MIME_TYPES.join(',')} // Accept only image MIME types
                            />
                            <label htmlFor="file-upload" className="cursor-pointer text-primary">
                                choose image
                            </label>
                        </div>
                        <div className='mb-0.5 -ml-2'>
                            <p className="text-foreground text-xs">
                                (Image size max 15 MB)
                            </p>
                        </div>
                        <label className="absolute w-full h-full cursor-pointer" htmlFor="file-upload" />
                    </div>
                    {IMAGE_EXTENSIONS?.length > 0 && (
                        <p className='text-xs text-stone-500 mt-1'>
                            Allowed types: {IMAGE_EXTENSIONS.map(ext => `.${ext}`).join(', ')}
                        </p>
                    )}
                </div>
            ) : (
                <FileItem // Renamed from FileItem to ImageFileItem in thoughts, but keeping FileItem for minimal changes
                    key={file.id}
                    file={file}
                    uploadProgress={uploadProgress}
                    cancelUpload={cancelUpload}
                    handleRetryUpload={handleRetryUpload}
                    deleteFile={deleteFile}
                    previewUrl={previewUrl} // Pass the preview URL
                />
            )}

        </div>
    )
}

export default SingleImageUpload // Renamed default export

const FileItem = memo(({ file, uploadProgress, cancelUpload, deleteFile, handleRetryUpload, previewUrl }) => {

    const [fileSize, setFileSize] = useState(`${file.file_size} b`);
    const [timeRemaining, setTimeRemaining] = useState(null); // Changed default to null for better control

    const uploadStartTimeRef = useRef(null);
    const prevUploadedBytesRef = useRef(0); // Renamed for clarity
    const uploadTimeIntervalRef = useRef(null); // Renamed for clarity
    const currentUploadProgressRef = useRef(uploadProgress); // Renamed for clarity

    // Update refs with latest props
    useEffect(() => {
        currentUploadProgressRef.current = uploadProgress;

        // Logic for starting/stopping time estimation based on uploadProgress
        if (uploadProgress && !uploadStartTimeRef.current && uploadProgress.percentComplete < 100) {
            startContinousTimeEstimation();
        } else if (!uploadProgress && uploadTimeIntervalRef.current) { // Upload finished or cancelled
            reinitialize();
        }
    }, [uploadProgress, file.file_size]);


    // Format file size once on mount or when file_size changes
    useEffect(() => {
        const sizeInBytes = file.file_size;
        if (sizeInBytes >= 1024 * 1024 * 1024) {
            setFileSize(`${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        } else if (sizeInBytes >= 1024 * 1024) {
            setFileSize(`${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`);
        } else if (sizeInBytes >= 1024) {
            setFileSize(`${(sizeInBytes / 1024).toFixed(2)} KB`);
        } else {
            setFileSize(`${sizeInBytes} B`);
        }
    }, [file.file_size]);


    const startContinousTimeEstimation = useCallback(() => {
        if (uploadTimeIntervalRef.current) return; // Prevent multiple intervals

        uploadStartTimeRef.current = Date.now();
        prevUploadedBytesRef.current = currentUploadProgressRef.current?.uploadedBytes || 0; // Initialize with current progress

        const intervalId = setInterval(() => {
            const currentProgress = currentUploadProgressRef.current;

            if (!currentProgress || currentProgress.percentComplete >= 100) {
                reinitialize();
                return;
            }

            const elapsedTime = Date.now() - uploadStartTimeRef.current; // Time since interval started
            const totalBytes = file.file_size;
            const uploadedBytes = currentProgress.uploadedBytes;

            // Calculate speed based on recent progress
            const bytesSinceLastInterval = uploadedBytes - prevUploadedBytesRef.current;
            const timeSinceLastInterval = 1000; // The interval duration itself (1 second)

            if (bytesSinceLastInterval <= 0 && elapsedTime > 3000) { // If no progress for 3 seconds
                setTimeRemaining(null);
                return;
            }

            const currentSpeed = bytesSinceLastInterval / (timeSinceLastInterval / 1000); // bytes per second
            const remainingBytesToUpload = totalBytes - uploadedBytes;

            if (currentSpeed > 0) { // Avoid division by zero
                const estimatedTime = remainingBytesToUpload / currentSpeed; // seconds
                setTimeRemaining(Math.round(estimatedTime));
            } else {
                setTimeRemaining(null); // No progress, can't estimate
            }

            prevUploadedBytesRef.current = uploadedBytes; // Update for next interval
        }, 1000);

        uploadTimeIntervalRef.current = intervalId;
    }, [file.file_size]); // Dependency on file.file_size is important

    const reinitialize = useCallback(() => {
        console.log("reinitialize");
        if (uploadTimeIntervalRef.current) {
            clearInterval(uploadTimeIntervalRef.current);
            uploadTimeIntervalRef.current = null;
        }
        uploadStartTimeRef.current = null;
        prevUploadedBytesRef.current = 0;
        currentUploadProgressRef.current = null;
        setTimeRemaining(null);
    }, []);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            reinitialize();
        };
    }, [reinitialize]);


    const formatTime = (seconds) => {
        if (seconds === null || seconds < 0) return ''; // Handle null or negative seconds

        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        } else if (mins > 0) {
            return `${mins}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    // Determine if the file is an image based on its type
    const isImage = file?.file_type && IMAGE_MIME_TYPES.includes(file.file_type);

    const FileIcon = memo(() => {
        const ext = file?.file_name?.split(".")?.pop()?.toLowerCase();
        const classname = "w-6 h-6";

        // If it's an image and we have a preview URL, don't show generic file icon
        if (isImage && previewUrl) return null;

        switch (ext) {
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
            case "webp":
            case "svg":
            case "bmp":
            case "tiff":
            case "tif":
                return <FaFileImage className={classname} />;
            default:
                return <FaFileAlt className={classname} />;
        }
    });

    return (
        <div key={file.id} className="overflow-hidden ring-1 ring-border rounded-md px-4 py-2">
            <div className="flex items-center justify-between">
                <div className='flex items-center gap-3'>
                    {/* Image Preview or File Icon */}
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={file?.file_name}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0" // Adjust size as needed
                        />
                    ) : (
                        <FileIcon />
                    )}
                    <div>
                        <p className='font-medium '>
                            {file?.file_name}
                        </p>
                        {!file?.failed ? (
                            <p className='text-xs text-neutral-500'>
                                {/* {fileSize} */}
                                {((uploadProgress && uploadProgress.percentComplete !== 100) && ` | ${uploadProgress?.percentComplete}%`)}
                                {((timeRemaining !== null && uploadProgress && uploadProgress.percentComplete < 100) && ` • ${formatTime(timeRemaining)} left`)}
                            </p>
                        ) : (
                            <p className='text-xs text-destructive '>{file?.message ? file.message : 'Failed to upload file'}</p>
                        )}
                    </div>
                </div>

                {file?.loading ? (
                    <LoaderCircleIcon className="animate-spin text-primary " />
                ) : uploadProgress && uploadProgress.percentComplete !== 100 ? (
                    <button onClick={() => cancelUpload(file.id, file?.file_name)} className="cursor-pointer">
                        <X size={22} className="text-amber-700" />
                    </button>
                ) : uploadProgress ? ( // When uploadProgress is not null but percentComplete is 100
                    <TextShimmer className='font-mono text-sm' duration={1}>
                        Processing...
                    </TextShimmer>
                ) : ( // When upload is complete or failed
                    <div className="flex gap-4">
                        <button onClick={() => deleteFile(file.id)} className="cursor-pointer">
                            <TrashIcon size={22} className="text-amber-700" />
                        </button>
                        {(file?.failed && file?.message === "Failed to upload") && (
                            <button onClick={() => handleRetryUpload(file)} className="cursor-pointer">
                                <RefreshCcw size={22} className="text-amber-700" />
                            </button>
                        )}
                    </div>
                )}

            </div>
            {uploadProgress && (uploadProgress.percentComplete > 0 && uploadProgress.percentComplete < 100) && ( // Show progress bar only during upload
                <div className="w-full bg-input rounded-full h-1.5 mt-3">
                    <div
                        className="bg-gradient-to-tr from-amber-400 to-amber-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress?.percentComplete}%` }}
                    />
                </div>
            )}
        </div>
    )
})
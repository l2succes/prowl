import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useChat } from '@/hooks/useChat';

interface InputBoxProps {
  sessionId: string;
  sendRequest: (method: string, params?: any) => Promise<any>;
}

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  base64?: string;
}

export default function InputBox({ sessionId, sendRequest }: InputBoxProps) {
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChat({ sessionId, sendRequest });

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newImages: PendingImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      const preview = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        base64,
      });
    }

    setPendingImages([...pendingImages, ...newImages]);
    setUploading(false);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Return full data URL (includes mime type)
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    const image = pendingImages.find(img => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setPendingImages(pendingImages.filter(img => img.id !== id));
  };

  const handleSend = async () => {
    if (!input.trim() && pendingImages.length === 0) return;

    const message = input;
    const images = pendingImages
      .filter(img => img.base64) // Only include images with base64 data
      .map(img => ({
        type: 'image' as const,
        data: img.base64!,
        mimeType: img.file.type,
      }));

    setInput('');
    setPendingImages([]);

    try {
      await sendMessage(message, images.length > 0 ? images : undefined);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return;
    
    e.preventDefault();
    setUploading(true);
    const newImages: PendingImage[] = [];

    for (const item of imageItems) {
      const file = item.getAsFile();
      if (!file) continue;

      const preview = URL.createObjectURL(file);
      const base64 = await fileToBase64(file);
      
      newImages.push({
        id: crypto.randomUUID(),
        file,
        preview,
        base64,
      });
    }

    setPendingImages([...pendingImages, ...newImages]);
    setUploading(false);
  };

  return (
    <div className="border-t border-border p-4">
      {/* Pending images preview */}
      {pendingImages.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {pendingImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.preview}
                alt="Pending upload"
                className="w-20 h-20 object-cover rounded-md border border-border"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {uploading && (
            <div className="w-20 h-20 bg-secondary rounded-md border border-border flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            className="flex-1 p-3 bg-secondary text-foreground rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type a message... (Cmd+Enter to send)"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </div>
        <div className="flex flex-col gap-2">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center"
            title="Upload image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          {/* Send button */}
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            onClick={handleSend}
            disabled={!input.trim() && pendingImages.length === 0}
          >
            Send
          </button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Press Cmd+Enter to send • Paste or click 📷 to add images
      </div>
    </div>
  );
}

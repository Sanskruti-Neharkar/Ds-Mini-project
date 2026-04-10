import { Upload, FileText, CheckCircle2, X, AlertCircle, Sparkles } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ExtractedResume {
  fileName: string;
  text: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  progress: number;
  done: boolean;
  extractedText?: string;
  error?: string;
}

interface Props {
  onUploadComplete: (resumes: ExtractedResume[]) => void;
}

export const ResumeUpload = ({ onUploadComplete }: Props) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (rawFiles: File[]) => {
    const validFiles = rawFiles.filter(f => f.name.toLowerCase().endsWith('.pdf') || f.name.toLowerCase().endsWith('.docx'));
    
    if (validFiles.length === 0) {
      setShakeError(true);
      toast.error("Invalid file format", { description: "Please upload PDF or DOCX files only." });
      setTimeout(() => setShakeError(false), 500);
      return;
    }

    const newFiles: UploadedFile[] = validFiles.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      progress: 0,
      done: false,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const fileId = newFiles[i].id;
        
        try {
            let extractedText = "";
            const arrayBuffer = await file.arrayBuffer();

            // Simulate progress while processing
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 30 } : f));

            if (file.name.toLowerCase().endsWith('.pdf')) {
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let text = "";
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    text += textContent.items.map((item: any) => item.str).join(" ") + "\n";
                    
                    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 30 + (pageNum / pdf.numPages) * 60 } : f));
                }
                extractedText = text;
            } else if (file.name.toLowerCase().endsWith('.docx')) {
                const result = await mammoth.extractRawText({ arrayBuffer });
                extractedText = result.value;
                setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 90 } : f));
            }

            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, done: true, extractedText } : f));
        } catch (error: any) {
            console.error("Error parsing file", file.name, error);
            setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 100, done: true, error: error.message } : f));
        }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const allDone = files.length > 0 && files.every(f => f.done);
  const successfulFiles = files.filter(f => f.done && !f.error && f.extractedText);

  const handleComplete = () => {
    const resumes: ExtractedResume[] = successfulFiles.map(f => ({
      fileName: f.name,
      text: f.extractedText || "",
    }));
    onUploadComplete(resumes);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 md:p-8 rounded-[2rem] flex flex-col h-full border border-border/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Candidates</h2>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-secondary text-muted-foreground rounded-lg tracking-wider uppercase border border-border/50">PDF / DOCX</span>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
        multiple 
      />

      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={handleClick}
        animate={{ x: shakeError ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: 0.4 }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 z-10 ${
          dragging
            ? "border-primary bg-primary/10 scale-[1.02] shadow-xl shadow-primary/5"
            : shakeError 
              ? "border-destructive bg-destructive/5" 
              : "border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
        }`}
      >
        <motion.div animate={{ y: dragging ? -5 : 0 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-20 rounded-full"></div>
            <div className="gradient-bg p-4 rounded-2xl relative z-10 shadow-xl shadow-primary/20">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold">Drop resumes here</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">Or click to browse your files. Up to 10MB per file.</p>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 space-y-2">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`glass-card rounded-xl p-3 flex items-center gap-3 border ${file.error ? 'border-destructive/30 bg-destructive/5' : 'border-border/50'}`}
              >
                <div className={`p-2 rounded-lg ${file.error ? "bg-destructive/10" : file.done ? "bg-success/10" : "gradient-bg-subtle"}`}>
                  {file.error ? <AlertCircle className="h-4 w-4 text-destructive" /> : 
                   file.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : 
                   <FileText className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.error ? <span className="text-destructive font-medium">Parsing failed</span> : file.size}
                  </p>
                  {!file.done && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full gradient-bg rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {allDone && successfulFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 relative z-10">
          <button
            onClick={(e) => { e.stopPropagation(); handleComplete(); }}
            className="group w-full gradient-bg text-primary-foreground font-bold text-lg py-4 rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/30 flex items-center justify-center gap-2 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Analyze {successfulFiles.length} Resume{successfulFiles.length > 1 ? "s" : ""}
            </span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

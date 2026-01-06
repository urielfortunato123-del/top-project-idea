import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PhotoStampProps {
  timestamp: Date | string;
  latitude?: number | null;
  longitude?: number | null;
  userName?: string;
  projectName?: string;
  companyName?: string;
}

export function PhotoStamp({
  timestamp,
  latitude,
  longitude,
  userName,
  projectName,
  companyName,
}: PhotoStampProps) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  
  const formattedDate = format(date, "dd/MM/yyyy", { locale: ptBR });
  const formattedTime = format(date, "HH:mm:ss", { locale: ptBR });
  
  const hasCoords = latitude != null && longitude != null;
  const coordsText = hasCoords 
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    : 'GPS indisponível';

  return (
    <div className="absolute bottom-2 right-2 text-right font-mono text-xs leading-tight pointer-events-none select-none">
      <div 
        className="px-2 py-1 rounded"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: '#D4A017', // Dark yellow/golden color
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="font-bold">{formattedDate} {formattedTime}</div>
        <div>{coordsText}</div>
        {userName && <div>{userName}</div>}
        {projectName && <div>{projectName}</div>}
        {companyName && <div className="text-[10px] opacity-80">{companyName}</div>}
      </div>
    </div>
  );
}

// Utility function to draw stamp on canvas for actual photo file
export async function drawStampOnImage(
  imageBlob: Blob,
  stampData: {
    timestamp: Date;
    latitude?: number | null;
    longitude?: number | null;
    userName?: string;
    projectName?: string;
    companyName?: string;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Prepare stamp text
        const date = stampData.timestamp;
        const formattedDate = format(date, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
        
        const hasCoords = stampData.latitude != null && stampData.longitude != null;
        const coordsText = hasCoords 
          ? `LAT: ${stampData.latitude!.toFixed(6)} | LON: ${stampData.longitude!.toFixed(6)}`
          : 'GPS indisponível';
        
        const lines: string[] = [];
        
        // Add company and project first (more prominent)
        if (stampData.companyName) lines.push(`🏢 ${stampData.companyName}`);
        if (stampData.projectName) lines.push(`📁 ${stampData.projectName}`);
        if (stampData.userName) lines.push(`👤 ${stampData.userName}`);
        lines.push(`📅 ${formattedDate}`);
        lines.push(`📍 ${coordsText}`);
        
        // Calculate font size based on image size (responsive)
        const fontSize = Math.max(Math.floor(img.width / 30), 16);
        const lineHeight = fontSize * 1.4;
        const padding = fontSize;
        
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        
        // Calculate text width for background
        const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
        const boxWidth = maxWidth + padding * 2;
        const boxHeight = lines.length * lineHeight + padding * 1.5;
        
        // Position in bottom-left corner
        const boxX = padding / 2;
        const boxY = img.height - boxHeight - padding / 2;
        
        // Draw semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, fontSize * 0.3);
        ctx.fill();
        
        // Draw text - bright yellow/orange color for visibility
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        lines.forEach((line, index) => {
          const y = boxY + padding * 0.75 + (index * lineHeight);
          ctx.fillText(line, boxX + padding, y);
        });
        
        URL.revokeObjectURL(url);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not create blob from canvas'));
            }
          },
          'image/jpeg',
          0.92
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    
    img.src = url;
  });
}


import React from 'react';
import { PDFIssue } from '@/types/pdf';

interface PDFAnnotationsProps {
  issues: PDFIssue[];
  pageNumber: number;
  scale: number;
}

const PDFAnnotations: React.FC<PDFAnnotationsProps> = ({ 
  issues, 
  pageNumber, 
  scale 
}) => {
  // Find issues for the current page
  const currentPageIssues = issues.filter(issue => issue.page === pageNumber);
  
  if (currentPageIssues.length === 0) {
    return null;
  }

  // Helper function to get color based on severity
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#ef4444'; // Red
      case 'warning':
      case 'medium':
        return '#f97316'; // Orange
      case 'low':
      case 'info':
        return '#3b82f6'; // Blue
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Helper function to get color with opacity
  const getSeverityColorWithOpacity = (severity: string, opacity: number): string => {
    switch (severity) {
      case 'critical':
        return `rgba(239, 68, 68, ${opacity})`; // Red with opacity
      case 'high':
        return `rgba(239, 68, 68, ${opacity})`; // Red with opacity
      case 'warning':
      case 'medium':
        return `rgba(249, 115, 22, ${opacity})`; // Orange with opacity
      case 'low':
      case 'info':
        return `rgba(59, 130, 246, ${opacity})`; // Blue with opacity
      default:
        return `rgba(59, 130, 246, ${opacity})`; // Blue with opacity
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {currentPageIssues.map((issue, index) => {
        if (!issue.location) return null;
        
        // Parse location if it's a string
        let locationObj;
        if (typeof issue.location === 'string') {
          try {
            locationObj = JSON.parse(issue.location);
          } catch (e) {
            console.error("Failed to parse location string:", e);
            return null;
          }
        } else {
          locationObj = issue.location;
        }
        
        // Check if locationObj has the required properties
        if (!locationObj || typeof locationObj.x !== 'number' || 
            typeof locationObj.y !== 'number' || 
            typeof locationObj.width !== 'number' || 
            typeof locationObj.height !== 'number') {
          return null;
        }
        
        const { x, y, width, height } = locationObj;
        
        // Calculate position based on scale
        const style = {
          left: `${x * scale * 100}%`,
          top: `${y * scale * 100}%`,
          width: `${width * scale * 100}%`,
          height: `${height * scale * 100}%`,
          border: `2px solid ${getSeverityColor(issue.severity)}`,
          backgroundColor: `${getSeverityColorWithOpacity(issue.severity, 0.2)}`,
        };
        
        return (
          <div 
            key={issue.id || index}
            className="absolute"
            style={style}
            title={issue.type || "Issue"}
          />
        );
      })}
    </div>
  );
};

export default PDFAnnotations;

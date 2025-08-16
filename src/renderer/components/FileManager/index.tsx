import React, { useState } from 'react';
import { VehicleData, VehicleFile } from '../../stores/vehicleStore';
import './FileManager.css';

interface FileManagerProps {
  vehicle: VehicleData;
}

export function FileManager({ vehicle }: FileManagerProps) {
  const [selectedFile, setSelectedFile] = useState<VehicleFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: VehicleFile): string => {
    if (file.isDirectory) return '📁';
    
    const extension = file.name.toLowerCase().split('.').pop();
    switch (extension) {
      case 'meta':
        return '⚙️';
      case 'yft':
        return '🚗';
      case 'ytd':
        return '🎨';
      case 'xml':
        return '📄';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  };

  // Sort files: folders first (alphabetically), then files (alphabetically)
  const sortFiles = (files: VehicleFile[]): VehicleFile[] => {
    return files.sort((a, b) => {
      // First sort by type: folders before files
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      
      // Then sort alphabetically within each type
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  };

  const renderFileTree = (files: VehicleFile[], level: number = 0, parentPath: string = '') => {
    // Debug: log what we're working with
    console.log(`Level ${level}, Parent: "${parentPath}", Total files: ${files.length}`);
    
    // Get only files at the current level (direct children of parentPath)
    const currentLevelFiles = files.filter(f => {
      if (level === 0) {
        // Root level: show only top-level folders and files
        const isTopLevel = !f.relativePath || !f.relativePath.includes('\\');
        console.log(`Root level: ${f.name} (${f.relativePath}) - ${isTopLevel ? 'SHOW' : 'HIDE'}`);
        return isTopLevel;
      } else {
        // Subfolder level: show only direct children of the current folder
        const relativePath = f.relativePath || '';
        const isDirectChild = relativePath.startsWith(parentPath + '\\') && 
                             relativePath !== parentPath &&
                             !relativePath.slice(parentPath.length + 1).includes('\\');
        console.log(`Subfolder level: ${f.name} (${relativePath}) - ${isDirectChild ? 'SHOW' : 'HIDE'}`);
        return isDirectChild;
      }
    });
    
    console.log(`Level ${level} filtered files:`, currentLevelFiles.map(f => f.name));
    
    // Sort the files at each level
    const sortedFiles = sortFiles(currentLevelFiles);
    
    return sortedFiles.map((file) => {
      const isExpanded = expandedFolders.has(file.path);
      const hasChildren = file.isDirectory && files.some(f => 
        f.relativePath && f.relativePath.startsWith((file.relativePath || '') + '\\') && 
        f.relativePath !== file.relativePath
      );

      return (
        <div key={file.path} className="file-item" style={{ paddingLeft: `${level * 16}px` }}>
          <div 
            className={`file-row ${selectedFile?.path === file.path ? 'selected' : ''}`}
            onClick={() => setSelectedFile(file)}
          >
            <span className="file-icon">
              {file.isDirectory ? '📁' : getFileIcon(file)}
            </span>
            <span className="file-name" title={file.name}>
              {file.name}
            </span>
            {!file.isDirectory && (
              <span className="file-size">
                {formatFileSize(file.size)}
              </span>
            )}
            {file.isDirectory && hasChildren && (
              <button
                className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(file.path);
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
          </div>
          
          {file.isDirectory && isExpanded && hasChildren && (
            <div className="folder-contents">
              {renderFileTree(files, level + 1, file.relativePath || '')}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <h3>Vehicle Files</h3>
        <div className="file-count">
          {vehicle.files.filter(f => !f.relativePath || !f.relativePath.includes('\\')).length} items
        </div>
      </div>
      
      <div className="file-tree">
        {renderFileTree(vehicle.files)}
      </div>
      
      {selectedFile && (
        <div className="file-details">
          <h4>File Details</h4>
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{selectedFile.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Path:</span>
            <span className="detail-value">{selectedFile.path}</span>
          </div>
          {!selectedFile.isDirectory && (
            <div className="detail-item">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{formatFileSize(selectedFile.size)}</span>
            </div>
          )}
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">
              {selectedFile.isDirectory ? 'Folder' : 'File'}
            </span>
          </div>
          
          {selectedFile.name.toLowerCase() === 'carcols.meta' && (
            <div className="carcols-actions">
              <button className="btn-primary">
                Edit in Editor
              </button>
              <button className="btn-secondary">
                Export
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

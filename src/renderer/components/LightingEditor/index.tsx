import React, { useState, useEffect } from 'react';
import { useLightingStore } from '../../stores/lightingStore';
import './LightingEditor.css';

interface LightingEditorProps {
  vehicle: any;
}

export function LightingEditor({ vehicle }: LightingEditorProps) {
  const {
    lightingData,
    selectedColor,
    bpm,
    currentRow,
    totalColumns,
    totalRows,
    setSelectedColor,
    setBPM,
    setCurrentRow,
    updateLight,
    setTotalColumns,
    carcolsConfig,
    currentSirenSetting,
    setCurrentSirenSetting
  } = useLightingStore();

  const [showSeparators, setShowSeparators] = useState(true);
  const [limitOneColorPerColumn, setLimitOneColorPerColumn] = useState(true);
  const [editingColumn, setEditingColumn] = useState<number | null>(null);
  const [showColumnEditor, setShowColumnEditor] = useState(false);
  const [editingLightProperties, setEditingLightProperties] = useState<{
    intensity: number;
    multiples: number;
    scaleFactor: number;
    direction: number;
  }>({
    intensity: 3.5,
    multiples: 1,
    scaleFactor: 100,
    direction: 0
  });
  const [customSelections, setCustomSelections] = useState<{
    scaleFactor: boolean;
    direction: boolean;
  }>({
    scaleFactor: true, // Default to custom since scaleFactor is 100
    direction: false   // Default to predefined since direction is 0
  });

  // Drag state for continuous marking/unmarking
  const [isDragging, setIsDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'mark' | 'unmark' | null>(null);

  // Handle global mouse up to stop dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setDragAction(null);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Professional siren colors matching the reference
  const sirenColors = [
    { id: 1, name: 'Red', color: '#FF0000', hex: '#FF0000' },
    { id: 2, name: 'Blue', color: '#0066FF', hex: '#0066FF' },
    { id: 3, name: 'White', color: '#FFFFFF', hex: '#FFFFFF' },
    { id: 4, name: 'Amber', color: '#FFB800', hex: '#FFB800' },
    { id: 5, name: 'Purple', color: '#8000FF', hex: '#8000FF' },
    { id: 6, name: 'Green', color: '#00FF00', hex: '#00FF00' },
    { id: 7, name: 'Light Blue', color: '#00FFFF', hex: '#00FFFF' },
    { id: 8, name: 'Pink', color: '#FF00FF', hex: '#FF00FF' }
  ];

  // Predefined scale factors
  const scaleFactors = [
    { label: '0.1 (10)', value: 0.1 },
    { label: '0.01 (100)', value: 0.01 },
    { label: 'Custom...', value: 'custom' }
  ];

  // Predefined directions
  const directions = [
    { label: 'Front (0°)', value: 0 },
    { label: 'Right (90°)', value: 90 },
    { label: 'Back (180°)', value: 180 },
    { label: 'Left (-90°)', value: -90 },
    { label: 'Front Right Passenger (45°)', value: 45 },
    { label: 'Back Right Passenger (135°)', value: 135 },
    { label: 'Back Left Passenger (-135°)', value: -135 },
    { label: 'Front Left Driver (-45°)', value: -45 },
    { label: 'Custom...', value: 'custom' }
  ];

  const handleLightClick = (row: number, column: number) => {
    if (limitOneColorPerColumn) {
      // Clear only the current row in the column, not the entire column
      updateLight(row, column, { color: 'none' });
    }
    
    // Get existing light properties or use defaults
    const existingLight = lightingData[row]?.[column];
    updateLight(row, column, {
      ...existingLight, // Preserve existing properties
      color: selectedColor,
      intensity: existingLight?.intensity || 3.5,
      multiples: existingLight?.multiples || 1,
      scaleFactor: existingLight?.scaleFactor || 100,
      direction: existingLight?.direction || 0
    });
  };

  const handleLightRightClick = (e: React.MouseEvent, row: number, column: number) => {
    e.preventDefault();
    updateLight(row, column, { color: 'none' });
  };

  // New drag handlers
  const handleMouseDown = (e: React.MouseEvent, row: number, column: number) => {
    // Left click = mark, Right click = unmark
    const isLeftClick = e.button === 0;
    const isRightClick = e.button === 2;
    
    if (isLeftClick) {
      // Left click: mark the cell
      setIsDragging(true);
      setDragAction('mark');
      handleLightClick(row, column);
    } else if (isRightClick) {
      // Right click: unmark the cell
      setIsDragging(true);
      setDragAction('unmark');
      updateLight(row, column, { color: 'none' });
    }
  };

  const handleMouseEnter = (row: number, column: number) => {
    if (isDragging && dragAction) {
      if (dragAction === 'mark') {
        // Mark the cell with selected color
        const existingLight = lightingData[row]?.[column];
        updateLight(row, column, {
          ...existingLight,
          color: selectedColor,
          intensity: existingLight?.intensity || 3.5,
          multiples: existingLight?.multiples || 1,
          scaleFactor: existingLight?.scaleFactor || 100,
          direction: existingLight?.direction || 0
        });
      } else if (dragAction === 'unmark') {
        // Unmark the cell
        updateLight(row, column, { color: 'none' });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragAction(null);
  };

  const handleColumnEdit = (columnIndex: number) => {
    setEditingColumn(columnIndex);
    
    // Load current column's light properties (use first active light as reference)
    const firstActiveLight = Array.from({ length: totalRows }, (_, row) => {
      const light = lightingData[row]?.[columnIndex];
      if (light && light.color !== 'none') return light;
      return null;
    }).find(light => light !== null);
    
    if (firstActiveLight) {
      setEditingLightProperties({
        intensity: firstActiveLight.intensity || 3.5,
        multiples: firstActiveLight.multiples || 1,
        scaleFactor: firstActiveLight.scaleFactor || 100,
        direction: firstActiveLight.direction || 0
      });
      
      // Set custom selections based on current values
      setCustomSelections({
        scaleFactor: firstActiveLight.scaleFactor !== 0.1 && firstActiveLight.scaleFactor !== 0.01,
        direction: !directions.some(d => d.value === (firstActiveLight.direction || 0))
      });
    } else {
      // Default values if no active lights
      setEditingLightProperties({
        intensity: 3.5,
        multiples: 1,
        scaleFactor: 100,
        direction: 0
      });
      
      // Default custom selections
      setCustomSelections({
        scaleFactor: true,  // 100 is not a predefined value
        direction: false    // 0 is a predefined value
      });
    }
    
    setShowColumnEditor(true);
  };

  const handleLoadFromCarcols = () => {
    // Load the lighting pattern from the current vehicle's carcols.meta
    const success = useLightingStore.getState().loadFromCurrentVehicle();
    if (success) {
      console.log('Successfully loaded lighting pattern from carcols.meta');
      // Close the modal after loading
      closeColumnEditor();
    } else {
      console.warn('Failed to load lighting pattern from carcols.meta');
      alert('Failed to load lighting pattern from carcols.meta. Make sure a vehicle folder is loaded.');
    }
  };

  const closeColumnEditor = () => {
    setShowColumnEditor(false);
    setEditingColumn(null);
  };

  const applyLightPropertiesToColumn = () => {
    if (editingColumn === null) return;
    
    // Apply properties to all active lights in the column
    for (let row = 0; row < totalRows; row++) {
      const currentLight = lightingData[row]?.[editingColumn];
      if (currentLight && currentLight.color !== 'none') {
        updateLight(row, editingColumn, {
          ...currentLight, // Preserve existing properties (color, etc.)
          intensity: editingLightProperties.intensity,
          multiples: editingLightProperties.multiples,
          scaleFactor: editingLightProperties.scaleFactor,
          direction: editingLightProperties.direction
        });
      }
    }
  };

  const getLightColor = (row: number, column: number) => {
    return lightingData[row]?.[column]?.color || 'none';
  };

  const clearGrid = () => {
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < totalColumns; col++) {
        updateLight(row, col, { color: 'none' });
      }
    }
  };

  const importPattern = () => {
    // TODO: Implement import functionality
    console.log('Import pattern...');
  };

  const exportPattern = () => {
    // TODO: Implement export functionality
    console.log('Export pattern...');
  };

  const resetEditor = () => {
    if (confirm('Are you sure you want to reset the entire editor? This cannot be undone.')) {
      clearGrid();
    }
  };

  return (
    <div className="lighting-editor">
      {/* Main Grid Area */}
      <div className="editor-main">
        {/* Grid Header with Preview and Settings */}
        <div className="grid-header">
          {/* Preview Row */}
          <div className="preview-row">
            <div className="preview-label">PREVIEW</div>
            {Array.from({ length: totalColumns }, (_, i) => {
              const hasActiveLights = Array.from({ length: totalRows }, (_, row) => 
                getLightColor(row, i) !== 'none'
              ).some(hasLight => hasLight);
              
              // Get the direction for this column (use first active light's direction)
              const columnDirection = Array.from({ length: totalRows }, (_, row) => {
                const light = lightingData[row]?.[i];
                if (light && light.color !== 'none') return light.direction || 0;
                return null;
              }).find(dir => dir !== null) || 0;
              
              return (
                <div 
                  key={i} 
                  className={`preview-arrow ${hasActiveLights ? 'active' : ''}`}
                  style={{
                    transform: `rotate(${columnDirection}deg)`,
                    transition: 'transform 0.3s ease'
                  }}
                  title={`Column ${i + 1} - Direction: ${columnDirection}°`}
                >
                  ↑
                </div>
              );
            })}
          </div>
          
          {/* Column Numbers */}
          <div className="column-numbers">
            {Array.from({ length: totalColumns }, (_, i) => (
              <div key={i} className="column-number">{i + 1}</div>
            ))}
          </div>
          
          {/* Column Settings */}
          <div className="column-settings">
            {Array.from({ length: totalColumns }, (_, i) => (
              <div 
                key={i} 
                className="column-setting"
                onClick={() => handleColumnEdit(i)}
                title={`Edit Column ${i + 1} Settings`}
              >
                ⚙️
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="lighting-grid">
          {Array.from({ length: totalRows }, (_, row) => (
            <div key={row} className={`grid-row ${row === currentRow ? 'current-row' : ''}`}>
              {Array.from({ length: totalColumns }, (_, column) => {
                const lightColor = getLightColor(row, column);
                
                return (
                  <div
                    key={column}
                    className={`grid-cell ${lightColor !== 'none' ? 'has-light' : ''}`}
                    style={{
                      backgroundColor: lightColor !== 'none' ? lightColor : 'transparent',
                      border: lightColor !== 'none' ? `2px solid ${lightColor}` : '1px solid #333',
                      cursor: isDragging ? (dragAction === 'mark' ? 'crosshair' : 'not-allowed') : 'pointer'
                    }}
                    onClick={() => handleLightClick(row, column)}
                    onContextMenu={(e) => handleLightRightClick(e, row, column)}
                    onMouseDown={(e) => handleMouseDown(e, row, column)}
                    onMouseEnter={() => handleMouseEnter(row, column)}
                    onMouseUp={handleMouseUp}
                    title={`Row ${row + 1}, Column ${column + 1}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar Toolbox */}
      <div className="editor-toolbox">
        <div className="toolbox-header">
          <h3>TOOLBOX</h3>
        </div>

        {/* Action Buttons */}
        <div className="toolbox-section">
          <div className="section-title">ACTIONS</div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={clearGrid}>
              Clear Grid
            </button>
          </div>
        </div>

        {/* BPM Control */}
        <div className="toolbox-section">
          <div className="section-title">ADJUST BPM</div>
          <div className="bpm-control">
            <input
              type="range"
              min="60"
              max="1200"
              step="10"
              value={bpm}
              onChange={(e) => setBPM(parseInt(e.target.value))}
              className="bpm-slider"
            />
            <div className="bpm-display">
              Current BPM: <span className="bpm-value">{bpm}</span>
            </div>
          </div>
        </div>

        {/* Siren Colors */}
        <div className="toolbox-section">
          <div className="section-title">SIREN COLORS</div>
          <div className="color-palette">
            {sirenColors.map((colorObj) => (
              <div
                key={colorObj.id}
                className={`color-option ${selectedColor === colorObj.hex ? 'selected' : ''}`}
                style={{ backgroundColor: colorObj.hex }}
                onClick={() => setSelectedColor(colorObj.hex)}
                title={`${colorObj.id} ${colorObj.name}`}
              >
                {selectedColor === colorObj.hex && <span className="checkmark">✓</span>}
                <span className="color-label">{colorObj.id} {colorObj.name}</span>
              </div>
            ))}
            <div className="color-option custom-color">
              <span className="custom-label">Custom</span>
              <span className="custom-plus">+</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="toolbox-section">
          <div className="section-title">SETTINGS</div>
          <div className="settings-options">
            <label className="setting-option">
              <input
                type="checkbox"
                checked={showSeparators}
                onChange={(e) => setShowSeparators(e.target.checked)}
              />
              <span className="setting-text">Show/hide separators</span>
              <span className="setting-description">This will show the created separators.</span>
            </label>
            
            <label className="setting-option">
              <input
                type="checkbox"
                checked={limitOneColorPerColumn}
                onChange={(e) => setLimitOneColorPerColumn(e.target.checked)}
              />
              <span className="setting-text">Limit one color per column</span>
              <span className="setting-description">This is useful for visualizing your pattern.</span>
            </label>
          </div>
        </div>

        {/* Total Columns Control */}
        <div className="toolbox-section">
          <div className="section-title">TOTAL COLUMNS</div>
          <div className="columns-control">
            <input
              type="range"
              min="1"
              max="32"
              step="1"
              value={totalColumns}
              onChange={(e) => {
                const newColumns = Number(e.target.value);
                setTotalColumns(newColumns);
                console.log('Setting total columns to:', newColumns);
              }}
              className="columns-slider"
            />
            <div className="columns-display">
              Columns: <span className="columns-value">{totalColumns}</span>
            </div>
          </div>
        </div>

        {/* Reset Editor - Moved to bottom */}
        <div className="toolbox-section">
          <button className="btn-reset" onClick={resetEditor}>
            RESET EDITOR
          </button>
        </div>
      </div>

      {/* Column Editor Modal */}
      {showColumnEditor && editingColumn !== null && (
        <div className="column-editor-modal">
          <div className="modal-overlay" onClick={closeColumnEditor}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Column {editingColumn + 1}</h3>
              <button className="modal-close" onClick={closeColumnEditor}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="column-info">
                <p><strong>Column:</strong> {editingColumn + 1}</p>
                <p><strong>Active Lights:</strong> {
                  Array.from({ length: totalRows }, (_, row) => 
                    getLightColor(row, editingColumn) !== 'none'
                  ).filter(hasLight => hasLight).length
                }</p>
              </div>
              
              {/* Light Properties Controls */}
              <div className="light-properties">
                <h4>Light Properties</h4>
                
                {/* Intensity Control */}
                <div className="property-control">
                  <label>Intensity:</label>
                  <div className="control-inputs">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editingLightProperties.intensity}
                      onChange={(e) => setEditingLightProperties(prev => ({
                        ...prev,
                        intensity: parseFloat(e.target.value)
                      }))}
                      className="property-slider"
                    />
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={editingLightProperties.intensity}
                      onChange={(e) => setEditingLightProperties(prev => ({
                        ...prev,
                        intensity: parseFloat(e.target.value) || 0
                      }))}
                      className="property-number"
                    />
                  </div>
                </div>
                
                {/* Multiples Control */}
                <div className="property-control">
                  <label>Multiples:</label>
                  <div className="control-inputs">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={editingLightProperties.multiples}
                      onChange={(e) => setEditingLightProperties(prev => ({
                        ...prev,
                        multiples: parseInt(e.target.value)
                      }))}
                      className="property-slider"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="1"
                      value={editingLightProperties.multiples}
                      onChange={(e) => setEditingLightProperties(prev => ({
                        ...prev,
                        multiples: parseInt(e.target.value) || 1
                      }))}
                      className="property-number"
                    />
                  </div>
                </div>
                
                {/* Scale Factor Control */}
                <div className="property-control">
                  <label>Scale Factor:</label>
                  <div className="control-inputs">
                    <select
                      value={customSelections.scaleFactor ? 'custom' : 
                             editingLightProperties.scaleFactor === 0.1 ? '0.1' : '0.01'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setEditingLightProperties(prev => ({
                            ...prev,
                            scaleFactor: parseFloat(e.target.value)
                          }));
                          setCustomSelections(prev => ({
                            ...prev,
                            scaleFactor: false
                          }));
                        } else {
                          setCustomSelections(prev => ({
                            ...prev,
                            scaleFactor: true
                          }));
                        }
                      }}
                      className="property-select"
                    >
                      {scaleFactors.map((factor) => (
                        <option key={factor.value} value={factor.value}>
                          {factor.label}
                        </option>
                      ))}
                    </select>
                    {customSelections.scaleFactor && (
                      <input
                        type="number"
                        min="0.001"
                        max="1000"
                        step="0.001"
                        value={editingLightProperties.scaleFactor}
                        onChange={(e) => setEditingLightProperties(prev => ({
                          ...prev,
                          scaleFactor: parseFloat(e.target.value) || 100
                        }))}
                        className="property-number"
                        placeholder="Custom value"
                      />
                    )}
                  </div>
                </div>
                
                {/* Direction Control */}
                <div className="property-control">
                  <label>Direction:</label>
                  <div className="control-inputs">
                    <select
                      value={customSelections.direction ? 'custom' : 
                             directions.find(d => d.value === editingLightProperties.direction)?.value || 'custom'}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setEditingLightProperties(prev => ({
                            ...prev,
                            direction: parseInt(e.target.value)
                          }));
                          setCustomSelections(prev => ({
                            ...prev,
                            direction: false
                          }));
                        } else {
                          setCustomSelections(prev => ({
                            ...prev,
                            direction: true
                          }));
                        }
                      }}
                      className="property-select"
                    >
                      {directions.map((direction) => (
                        <option key={direction.value} value={direction.value}>
                          {direction.label}
                        </option>
                      ))}
                    </select>
                    {customSelections.direction && (
                      <input
                        type="number"
                        min="-180"
                        max="180"
                        step="1"
                        value={editingLightProperties.direction}
                        onChange={(e) => setEditingLightProperties(prev => ({
                          ...prev,
                          direction: parseInt(e.target.value) || 0
                        }))}
                        className="property-number"
                        placeholder="Custom degrees"
                      />
                    )}
                  </div>
                </div>
                
                {/* Apply Properties Button */}
                <button 
                  className="btn-primary"
                  onClick={() => {
                    applyLightPropertiesToColumn();
                    closeColumnEditor();
                  }}
                >
                  Apply Properties to Column
                </button>
                
                {/* Load from carcols.meta Button */}
                <button 
                  className="btn-secondary"
                  onClick={handleLoadFromCarcols}
                  style={{ marginTop: '10px' }}
                >
                  Load from carcols.meta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

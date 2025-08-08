import React, { useState, useMemo, useCallback, useEffect } from "react";
import { HexGrid, Layout, Hexagon } from "react-hexgrid";

// Constants
const PROBABILITY_MAP = {
  2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36, 6: 5/36,
  8: 5/36, 9: 4/36, 10: 3/36, 11: 2/36, 12: 1/36
};

const RESOURCE_VALUE = {
  wheat: 1.0,
  wood: 0.9,
  ore: 1.0,
  sheep: 0.8,
  brick: 0.75,
  desert: 0
};

const RESOURCE_COLORS = {
  wood: "#228B22", brick: "#CD853F", wheat: "#FFD700",
  ore: "#696969", sheep: "#90EE90", desert: "#F4A460", none: "#E8E8E8"
};

const RESOURCE_OPTIONS = [
  { name: "wood", label: "🌲 Wood", color: "#228B22", emoji: "🌲" },
  { name: "brick", label: "🧱 Brick", color: "#CD853F", emoji: "🧱" },
  { name: "wheat", label: "🌾 Wheat", color: "#FFD700", emoji: "🌾" },
  { name: "ore", label: "⛰️ Ore", color: "#696969", emoji: "⛰️" },
  { name: "sheep", label: "🐑 Sheep", color: "#90EE90", emoji: "🐑" },
  { name: "desert", label: "🏜️ Desert", color: "#F4A460", emoji: "🏜️" }
];

// Utility functions
const generateBoard = (radius = 2) => {
  const hexes = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.abs(s) <= radius) {
        hexes.push({ q, r, resource: "none", number: null });
      }
    }
  }
  return hexes;
};

const getResourceColor = (resource) => RESOURCE_COLORS[resource] || RESOURCE_COLORS.none;

// Mobile detection
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Button styles
const buttonStyles = {
  analyze: (isEnabled) => ({
    background: isEnabled 
      ? 'linear-gradient(135deg, #4CAF50, #45a049)' 
      : 'linear-gradient(135deg, #ccc, #999)',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    borderRadius: '25px',
    cursor: isEnabled ? 'pointer' : 'not-allowed',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: isEnabled 
      ? '0 4px 15px rgba(76, 175, 80, 0.3)' 
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    opacity: 1
  }),
  resource: (isSelected, color) => ({
    backgroundColor: isSelected ? color : '#f0f0f0',
    color: isSelected ? '#fff' : '#333',
    border: `2px solid ${color}`,
    fontSize: isSelected ? '16px' : '14px',
    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
  })
};

function App() {
  const [hexes, setHexes] = useState(generateBoard(2));
  const [selectedResource, setSelectedResource] = useState(null);
  const [editingNumber, setEditingNumber] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState(false);
  const isMobile = useIsMobile();

  // Responsive dimensions
  const gridDimensions = useMemo(() => {
    if (isMobile) {
      return {
        width: Math.min(window.innerWidth - 40, 400),
        height: Math.min(window.innerHeight * 0.6, 500),
        size: { x: 5, y: 5 },
        spacing: 1.0
      };
    }
    return {
      width: 1000,
      height: 800,
      size: { x: 7, y: 7 },
      spacing: 1.15
    };
  }, [isMobile]);

  // Memoized handlers
  const handleHexClick = useCallback((q, r) => {
    if (!selectedResource) return;
    
    setHexes(prev =>
      prev.map(h => 
        h.q === q && h.r === r 
          ? { ...h, resource: selectedResource, number: selectedResource === "desert" ? null : h.number }
          : h
      )
    );
    setAnalysisResults([]);
    setSelectedSettlement(null);
  }, [selectedResource]);

  const handleNumberChange = useCallback((q, r, value) => {
    const number = value === "" ? null : parseInt(value, 10);
    if (value === "" || (number >= 1 && number <= 12 && number !== 7)) {
      setHexes(prev =>
        prev.map(h => h.q === q && h.r === r ? { ...h, number } : h)
      );
      setAnalysisResults([]);
      setSelectedSettlement(null);
    }
  }, []);

  const startEditingNumber = useCallback((q, r, e) => {
    e.stopPropagation();
    const hex = hexes.find(h => h.q === q && h.r === r);
    if (hex && hex.resource !== "desert") {
      setEditingNumber(`${q},${r}`);
    }
  }, [hexes]);

  // Memoized utility functions
  const randomizeBoard = useCallback(() => {
    // Create realistic Catan resource distribution
    const resourcePool = [
      ...Array(4).fill('wood'),
      ...Array(4).fill('sheep'),
      ...Array(4).fill('wheat'),
      ...Array(3).fill('brick'),
      ...Array(3).fill('ore'),
      ...Array(1).fill('desert')
    ];
    
    // Create realistic Catan number distribution (excluding 7)
    const numberPool = [
      2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12
    ];
    
    // Shuffle arrays
    const shuffledResources = [...resourcePool].sort(() => Math.random() - 0.5);
    const shuffledNumbers = [...numberPool].sort(() => Math.random() - 0.5);
    
    let numberIndex = 0;
    const newHexes = hexes.map((hex, index) => {
      const resource = shuffledResources[index];
      // Only assign a number if it's not a desert
      const number = resource === "desert" ? null : shuffledNumbers[numberIndex++];
      return { ...hex, resource, number };
    });
    
    setHexes(newHexes);
    setAnalysisResults([]);
    setSelectedSettlement(null);
  }, [hexes]);

  const clearBoard = useCallback(() => {
    setHexes(generateBoard(2));
    setAnalysisResults([]);
    setSelectedSettlement(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const [q, r] = editingNumber.split(',').map(Number);
    handleNumberChange(q, r, e.target.value);
  }, [editingNumber, handleNumberChange]);

  const handleInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingNumber(null);
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    setEditingNumber(null);
  }, []);

  const isBoardFilled = useMemo(() => {
    return hexes.every(hex => {
      const hasResource = hex.resource !== "none";
      const hasValidNumber = hex.resource === "desert" || hex.number !== null;
      return hasResource && hasValidNumber;
    });
  }, [hexes]);

  const getCursorStyle = useCallback(() => {
    if (!selectedResource) return 'default';
    const emoji = RESOURCE_OPTIONS.find(r => r.name === selectedResource)?.emoji;
    return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text y="20" font-size="20">${emoji}</text></svg>') 12 12, auto`;
  }, [selectedResource]);

  const handleAnalyzeClick = useCallback(() => {
    if (isBoardFilled) {
      const validHexes = hexes.filter(h => h.resource !== "none" && h.number);
      const settlements = [];
      
      validHexes.forEach(hex => {
        const neighbors = [];
        const directions = [
          [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]
        ];
        
        directions.forEach(dir => {
          const neighborQ = hex.q + dir[0];
          const neighborR = hex.r + dir[1];
          const neighbor = validHexes.find(h => h.q === neighborQ && h.r === neighborR);
          if (neighbor) {
            neighbors.push(neighbor);
          }
        });
        
        for (let i = 0; i < neighbors.length; i++) {
          for (let j = i + 1; j < neighbors.length; j++) {
            const hex1 = neighbors[i];
            const hex2 = neighbors[j];
            
            const isAdjacent = directions.some(dir => {
              const q1 = hex1.q + dir[0];
              const r1 = hex1.r + dir[1];
              return q1 === hex2.q && r1 === hex2.r;
            });
            
            if (isAdjacent) {
              const settlementHexes = [hex, hex1, hex2];
              const vertexQ = (hex.q + hex1.q + hex2.q) / 3;
              const vertexR = (hex.r + hex1.r + hex2.r) / 3;
              
              const spotKey = settlementHexes.map(h => `${h.q},${h.r}`).sort().join('|');
              const exists = settlements.some(s => s.key === spotKey);
              
              if (!exists) {
                settlements.push({
                  key: spotKey,
                  hexes: settlementHexes,
                  vertex: { q: vertexQ, r: vertexR }
                });
              }
            }
          }
        }
      });
      
      const scoreSpot = (hexes) => {
        const pipScore = hexes.reduce((sum, h) =>
          sum + (PROBABILITY_MAP[h.number] || 0) * RESOURCE_VALUE[h.resource],
          0
        );

        const diversityBonus = new Set(hexes.map(h => h.resource)).size * 0.1;


        return (pipScore + diversityBonus )*36*4;
      };
      
      const scored = settlements.map((settlement) => {
        const sortedHexes = [...settlement.hexes];
        const centerQ = sortedHexes.reduce((sum, h) => sum + h.q, 0) / 3;
        const centerR = sortedHexes.reduce((sum, h) => sum + h.r, 0) / 3;
        
        const hexDistances = sortedHexes.map(hex => ({
          hex,
          distance: Math.sqrt((hex.q - centerQ) ** 2 + (hex.r - centerR) ** 2)
        }));
        
        hexDistances.sort((a, b) => b.distance - a.distance);
        const pointHex = hexDistances[0].hex;
        const baseHexes = sortedHexes.filter(h => h !== pointHex);
        baseHexes.sort((a, b) => a.q - b.q);
        
        const isUpward = pointHex.r < centerR;
        let topHex, leftHex, rightHex;
        
        if (isUpward) {
          topHex = pointHex;
          leftHex = baseHexes[0];
          rightHex = baseHexes[1];
        } else {
          topHex = baseHexes[0];
          leftHex = baseHexes[1];
          rightHex = pointHex;
        }
        
        const finalOrder = [topHex, leftHex, rightHex];
        
        return {
          score: scoreSpot(settlement.hexes),
          center: finalOrder.map(h => ({ q: h.q, r: h.r, resource: h.resource, number: h.number })),
          resources: finalOrder.map(h => h.resource),
          numbers: finalOrder.map(h => h.number),
          diversity: new Set(settlement.hexes.map(h => h.resource)).size,
          vertex: settlement.vertex,
          hexCoords: settlement.hexes.map(h => ({ q: h.q, r: h.r }))
        };
      });
      
      scored.sort((a, b) => b.score - a.score);
      
      const rankedResults = scored.slice(0, 10).map((result, index) => ({
        ...result,
        rank: index + 1
      }));
      
      setAnalysisResults(rankedResults);
      // Automatically select the best spot (rank 1)
      setSelectedSettlement(rankedResults[0]);
    }
  }, [isBoardFilled, hexes]);

  const handleSettlementSelect = useCallback((settlement) => {
    setSelectedSettlement(selectedSettlement?.rank === settlement.rank ? null : settlement);
  }, [selectedSettlement]);

  const handleMouseEnter = useCallback((e) => {
    if (selectedResource && !isMobile) {
      e.target.style.opacity = "0.9";
      e.target.style.filter = "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.7)) brightness(1.3)";
    }
  }, [selectedResource, isMobile]);

  const handleMouseLeave = useCallback((e, hexResource) => {
    if (selectedResource && !isMobile) {
      e.target.style.opacity = "1";
      e.target.style.filter = hexResource === selectedResource 
        ? "drop-shadow(0 3px 6px rgba(255, 107, 53, 0.3))"
        : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))";
    }
  }, [selectedResource, isMobile]);

  return (
    <div className="hex-grid-container" style={{ cursor: getCursorStyle() }}>
      <h1 className="text-3xl font-bold text-center text-gray-800" style={{ 
        margin: "0 0 16px 0",
        fontSize: isMobile ? "24px" : "32px"
      }}>
        Catanalyzer
      </h1>
      <h2 className="text-xl text-center text-gray-600" style={{ 
        margin: "0 0 16px 0",
        fontSize: isMobile ? "16px" : "20px"
      }}>
        Catan Settlement Optimizer
      </h2>
      
      <div className="instructions" style={{ 
        marginBottom: isMobile ? "20px" : "40px",
        fontSize: isMobile ? "12px" : "14px"
      }}>
        <p>Click on hexagons to set their number token. Set resource layout by using the bottom panel.</p>
        <p>Select and view optimal settlement locations from the analysis results.</p>
        <p> For additional information on the analysis, see our&nbsp;
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              setShowAlgorithmInfo(true);
            }}
            style={{
              color: '#4CAF50',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
             scoring algorithm 
          </a>
        </p>
      </div>
      
      <div className="controls" style={{ 
        marginBottom: "8px",
        gap: isMobile ? "8px" : "10px"
      }}>
        <button 
          onClick={randomizeBoard}
          style={{
            padding: isMobile ? "10px 16px" : "12px 24px",
            fontSize: isMobile ? "12px" : "14px"
          }}
        >
          Randomize
        </button>
        <button 
          onClick={clearBoard}
          style={{
            padding: isMobile ? "10px 16px" : "12px 24px",
            fontSize: isMobile ? "12px" : "14px"
          }}
        > 
          Clear All 
        </button>
      </div>

      {/* Analyze Board Button */}
      <div style={{ textAlign: 'center', marginTop: '5px', marginBottom: '10px' }}>
        <button
          onClick={handleAnalyzeClick}
          disabled={!isBoardFilled}
          style={{
            ...buttonStyles.analyze(isBoardFilled),
            padding: isMobile ? "12px 24px" : "15px 30px",
            fontSize: isMobile ? "14px" : "16px"
          }}
          onMouseEnter={(e) => {
            if (isBoardFilled && !isMobile) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (isBoardFilled && !isMobile) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
            }
          }}
        >
          Analyze Board
        </button>
      </div>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <div className="analysis-results" style={{
          maxWidth: isMobile ? "95vw" : "500px",
          margin: isMobile ? "10px auto" : "15px auto"
        }}>
          <h3 style={{ fontSize: isMobile ? "16px" : "18px" }}>Top Settlements</h3>
          <div className="results-container" style={{
            maxHeight: isMobile ? "150px" : "200px",
            minWidth: isMobile ? "300px" : "400px"
          }}>
            {analysisResults.map((result, index) => (
              <div 
                key={index} 
                className={`result-row ${selectedSettlement?.rank === result.rank ? 'selected' : ''}`}
                onClick={() => handleSettlementSelect(result)}
                style={{ 
                  cursor: 'pointer',
                  padding: isMobile ? "6px 8px" : "8px 12px",
                  fontSize: isMobile ? "12px" : "14px"
                }}
              >
                <div className="rank-score">
                  <span className="rank" style={{ fontSize: isMobile ? "12px" : "14px" }}>#{result.rank}</span>
                  <span className="score" style={{ fontSize: isMobile ? "14px" : "16px" }}>{result.score.toFixed(1)}</span>
                </div>
                <div className="resources-numbers" style={{
                  gap: isMobile ? "4px" : "8px",
                  marginLeft: isMobile ? "10px" : "15px"
                }}>
                  {result.center.map((hex, hexIndex) => (
                    <span key={hexIndex} className="resource-number" style={{
                      padding: isMobile ? "2px 6px" : "4px 8px",
                      fontSize: isMobile ? "12px" : "14px"
                    }}>
                      {RESOURCE_OPTIONS.find(r => r.name === hex.resource)?.emoji} {hex.number}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <HexGrid width={gridDimensions.width} height={gridDimensions.height}>
          <Layout size={gridDimensions.size} flat={false} spacing={gridDimensions.spacing} origin={{ x: 0, y: 0 }}>
            {hexes.map((hex) => {
              const isSelected = selectedSettlement?.hexCoords.some(h => h.q === hex.q && h.r === hex.r);
              
              return (
                <Hexagon
                  key={`${hex.q}-${hex.r}`}
                  q={hex.q}
                  r={hex.r}
                  s={-hex.q - hex.r}
                  onClick={() => handleHexClick(hex.q, hex.r)}
                  style={{
                    fill: isSelected ? "#2196F3" : getResourceColor(hex.resource),
                    stroke: isSelected ? "#1976D2" : selectedResource === hex.resource ? "#FF6B35" : "#999",
                    strokeWidth: isSelected ? 1.5 : selectedResource === hex.resource ? 1.5 : 0.5,
                    filter: isSelected ? "drop-shadow(0 0 20px rgba(33, 150, 243, 0.8)) brightness(1.2)" : 
                           selectedResource === hex.resource ? "drop-shadow(0 3px 6px rgba(255, 107, 53, 0.3))" :
                           "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    opacity: 1,
                    transition: "opacity 0.2s ease, filter 0.2s ease"
                  }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={(e) => handleMouseLeave(e, hex.resource)}
                >
                  <text 
                    x="0" y="0.15" textAnchor="middle" fontSize={isMobile ? "0.15" : "0.2"} 
                    fill="#333" fontWeight="bold" stroke="none"
                  >
                    {hex.resource !== "none" ? hex.resource.toUpperCase() : ""}
                  </text>
                  {hex.resource !== "desert" && (
                    <text 
                      x="0" y="0.5" textAnchor="middle" fontSize={isMobile ? "2.2" : "3.0"} 
                      fontWeight="bold" fill={hex.number === 6 || hex.number === 8 ? "#8B0000" : "#000"} stroke="white" strokeWidth="0.02"
                      fontStyle="italic" 

                      onClick={(e) => {
                        if (!selectedResource) {
                          startEditingNumber(hex.q, hex.r, e);
                        }
                      }}
                      style={{ 
                        cursor: selectedResource ? "inherit" : "pointer",
                        opacity: selectedResource ? 0.5 : 1
                      }}
                    >
                      {hex.number || "Set #"}
                    </text>
                  )}
                  {hex.resource === "desert" && (
                    <text 
                      x="0" y="0.5" textAnchor="middle" fontSize={isMobile ? "2.0" : "2.5"} 
                      fontWeight="bold" fill="#000" stroke="white" strokeWidth="0.02"
                    >
                      🌵
                    </text>
                  )}
                </Hexagon>
              );
            })}
          </Layout>
        </HexGrid>
      </div>

      {/* Overlay input for editing numbers */}
      {editingNumber && (
        <div className="hex-input-overlay">
          <input
            type="number"
            min="2"
            max="12"
            placeholder="2-12"
            value={hexes.find(h => `${h.q},${h.r}` === editingNumber)?.number || ""}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            autoFocus
            className="hex-overlay-input"
          />
        </div>
      )}

      <div className="resource-selector" style={{ 
        marginTop: "5px",
        padding: isMobile ? "8px" : "10px"
      }}>
        <h3 style={{ fontSize: isMobile ? "16px" : "18px" }}>Select Resource:</h3>
        <div className="resource-buttons" style={{
          gap: isMobile ? "6px" : "10px",
          marginBottom: isMobile ? "10px" : "15px"
        }}>
          {RESOURCE_OPTIONS.map((resource) => (
            <button
              key={resource.name}
              className={`resource-btn ${selectedResource === resource.name ? 'active' : ''}`}
              onClick={() => setSelectedResource(selectedResource === resource.name ? null : resource.name)}
              style={{
                ...buttonStyles.resource(selectedResource === resource.name, resource.color),
                padding: isMobile ? "8px 12px" : "12px 20px",
                fontSize: isMobile ? "12px" : "14px",
                minWidth: isMobile ? "80px" : "100px"
              }}
            >
              <span style={{ 
                fontSize: isMobile ? '14px' : '18px', 
                marginRight: isMobile ? '4px' : '8px' 
              }}>{resource.emoji}</span>
              {isMobile ? resource.name.charAt(0).toUpperCase() : resource.name.charAt(0).toUpperCase() + resource.name.slice(1)}
            </button>
          ))}
        </div>
        <p className="paint-instructions" style={{
          fontSize: isMobile ? "11px" : "14px",
          lineHeight: isMobile ? "1.3" : "1.4"
        }}>
          Selected: <strong>{selectedResource ? RESOURCE_OPTIONS.find(r => r.name === selectedResource)?.label : "None"}</strong> 
          - Select a resource to paint it on the board. Select again to reset your cursor.
        </p>
      </div>

      {/* Algorithm Explanation Popup */}
      {showAlgorithmInfo && (
        <div className="algorithm-popup-overlay" onClick={() => setShowAlgorithmInfo(false)}>
          <div className="algorithm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>How the Catanalyzer Scores Spots</h2>
              <button 
                className="close-button"
                onClick={() => setShowAlgorithmInfo(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="popup-content">
              <p>
                This tool analyzes every possible settlement location and ranks them based on how strong they are for&nbsp;
                <strong>long‑term success</strong> in Catan. Here's how the algorithm works under the hood:
              </p>

              <div className="scoring-section">
                <h4><br></br>Expected Resource Production</h4>
                <p>
                  Every number token has a probability of being rolled (e.g., <strong>6</strong> and <strong>8</strong> ≈ 13.9%,&nbsp;
                  <strong>5</strong> and <strong>9</strong> ≈ 11.1%). The algorithm adds up the production probabilities for each
                  adjacent hex to a spot. Higher‑probability numbers mean more frequent resources.
                </p>
              </div>

              <div className="scoring-section">
                <h4>Relative Resource Value</h4>
                <p>Not all resources are equally valuable in most games:</p>
                <div className="resource-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Resource</th>
                        <th>Weight</th>
                        <th>Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>🌾 Wheat</td>
                        <td>1.0</td>
                        <td>Needed for both settlements & cities; essential all game.</td>
                      </tr>
                      <tr>
                        <td>⛰️ Ore</td>
                        <td>1.0</td>
                        <td>Key for cities & development cards; strong in mid‑game.</td>
                      </tr>
                      <tr>
                        <td>🌲 Wood</td>
                        <td>0.9</td>
                        <td>Vital early‑game for roads & settlements.</td>
                      </tr>
                      <tr>
                        <td>🐑 Sheep</td>
                        <td>0.8</td>
                        <td>Needed early & for development cards, but easiest to trade away.</td>
                      </tr>
                      <tr>
                        <td>🧱 Brick</td>
                        <td>0.75</td>
                        <td>Pairs with wood for expansion; drops in importance later.</td>
                      </tr>
                      <tr>
                        <td>🏜️ Desert</td>
                        <td>0</td>
                        <td>Produces nothing.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="scoring-section">
                <h4>Diversity Bonus</h4>
                <p>
                  Having a mix of different resources reduces risk from bad luck streaks, robber targeting, and trading bottlenecks.
                  More variety means a safer and more adaptable in-game economy.
                </p>
                <p><strong>+0.1 points</strong> for each unique resource type in the settlement.</p>
              </div>

              

              <div className="scoring-section">
                <h4>Final Score</h4>
                <div className="score-formula">
                  <p><strong>Final Score = (Probability × Resource Value + Diversity Bonus ) </strong></p>
                </div>
                <p>Higher scores = more likely to set you up for a strong game.</p>
              </div>

              <div className="tip-section">
                <p><em>💡 Tip:</em> The algorithm matches competitive strategy insights, but Catan also has luck and player interaction. Use scores as a guide, not a rule. Ports, opponent positions, and development card opportunities also matter.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

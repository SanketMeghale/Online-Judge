import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Columns,
  GripHorizontal,
  GripVertical,
  Layout,
  LayoutGrid,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelTop,
  RotateCcw,
  Rows,
  Sparkles,
  Zap
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import "../../styles/workspace.css";

const STORAGE_KEY = "judgo-workspace-layout-v3";

let splitIdCounter = 1;
function genSplitId() {
  return `split_${Date.now()}_${splitIdCounter++}`;
}

export const WORKSPACE_PRESETS = {
  default: {
    name: "Standard IDE",
    icon: Layout,
    tree: {
      type: "split",
      id: "split-root",
      direction: "horizontal",
      splitRatio: 0.46,
      first: { type: "panel", panelId: "problem" },
      second: {
        type: "split",
        id: "split-sub",
        direction: "vertical",
        splitRatio: 0.58,
        first: { type: "panel", panelId: "editor" },
        second: { type: "panel", panelId: "result" }
      }
    }
  },
  threeColumn: {
    name: "3-Column Arena",
    icon: Columns,
    tree: {
      type: "split",
      id: "split-root",
      direction: "horizontal",
      splitRatio: 0.33,
      first: { type: "panel", panelId: "problem" },
      second: {
        type: "split",
        id: "split-sub",
        direction: "horizontal",
        splitRatio: 0.5,
        first: { type: "panel", panelId: "editor" },
        second: { type: "panel", panelId: "result" }
      }
    }
  },
  stacked: {
    name: "Vertical Stack",
    icon: Rows,
    tree: {
      type: "split",
      id: "split-root",
      direction: "vertical",
      splitRatio: 0.36,
      first: { type: "panel", panelId: "editor" },
      second: {
        type: "split",
        id: "split-sub",
        direction: "vertical",
        splitRatio: 0.5,
        first: { type: "panel", panelId: "result" },
        second: { type: "panel", panelId: "problem" }
      }
    }
  },
  editorFocus: {
    name: "Editor & Result Left",
    icon: PanelLeft,
    tree: {
      type: "split",
      id: "split-root",
      direction: "horizontal",
      splitRatio: 0.55,
      first: {
        type: "split",
        id: "split-sub",
        direction: "vertical",
        splitRatio: 0.6,
        first: { type: "panel", panelId: "editor" },
        second: { type: "panel", panelId: "result" }
      },
      second: { type: "panel", panelId: "problem" }
    }
  }
};

// ---------------------------------------------------------------------------
// Tree Helper Functions
// ---------------------------------------------------------------------------

function cloneTree(node) {
  if (!node) return null;
  if (node.type === "panel") {
    return { type: "panel", panelId: node.panelId };
  }
  return {
    type: "split",
    id: node.id || genSplitId(),
    direction: node.direction,
    splitRatio: typeof node.splitRatio === "number" ? node.splitRatio : 0.5,
    first: cloneTree(node.first),
    second: cloneTree(node.second)
  };
}

function collectPanelIds(node, acc = new Set()) {
  if (!node) return acc;
  if (node.type === "panel") {
    acc.add(node.panelId);
    return acc;
  }
  collectPanelIds(node.first, acc);
  collectPanelIds(node.second, acc);
  return acc;
}

function removePanelFromTree(node, targetPanelId) {
  if (!node) return null;
  if (node.type === "panel") {
    return node.panelId === targetPanelId ? null : node;
  }

  const newFirst = removePanelFromTree(node.first, targetPanelId);
  const newSecond = removePanelFromTree(node.second, targetPanelId);

  if (!newFirst && !newSecond) return null;
  if (!newFirst) return newSecond;
  if (!newSecond) return newFirst;

  return {
    ...node,
    first: newFirst,
    second: newSecond
  };
}

function insertPanelIntoTree(node, targetPanelId, zone, panelToInsert) {
  if (!node) return { type: "panel", panelId: panelToInsert };

  if (node.type === "panel") {
    if (node.panelId !== targetPanelId) return node;

    const targetLeaf = { type: "panel", panelId: targetPanelId };
    const insertedLeaf = { type: "panel", panelId: panelToInsert };

    if (zone === "swap") {
      return insertedLeaf;
    }
    if (zone === "top") {
      return {
        type: "split",
        id: genSplitId(),
        direction: "vertical",
        splitRatio: 0.5,
        first: insertedLeaf,
        second: targetLeaf
      };
    }
    if (zone === "bottom") {
      return {
        type: "split",
        id: genSplitId(),
        direction: "vertical",
        splitRatio: 0.5,
        first: targetLeaf,
        second: insertedLeaf
      };
    }
    if (zone === "left") {
      return {
        type: "split",
        id: genSplitId(),
        direction: "horizontal",
        splitRatio: 0.5,
        first: insertedLeaf,
        second: targetLeaf
      };
    }
    if (zone === "right") {
      return {
        type: "split",
        id: genSplitId(),
        direction: "horizontal",
        splitRatio: 0.5,
        first: targetLeaf,
        second: insertedLeaf
      };
    }
    return node;
  }

  return {
    ...node,
    first: insertPanelIntoTree(node.first, targetPanelId, zone, panelToInsert),
    second: insertPanelIntoTree(node.second, targetPanelId, zone, panelToInsert)
  };
}

function swapPanelsInTree(node, idA, idB) {
  if (!node) return null;
  if (node.type === "panel") {
    if (node.panelId === idA) return { type: "panel", panelId: idB };
    if (node.panelId === idB) return { type: "panel", panelId: idA };
    return node;
  }
  return {
    ...node,
    first: swapPanelsInTree(node.first, idA, idB),
    second: swapPanelsInTree(node.second, idA, idB)
  };
}

function updateSplitRatioInTree(node, splitId, nextRatio) {
  if (!node || node.type === "panel") return node;
  if (node.id === splitId) {
    return { ...node, splitRatio: nextRatio };
  }
  return {
    ...node,
    first: updateSplitRatioInTree(node.first, splitId, nextRatio),
    second: updateSplitRatioInTree(node.second, splitId, nextRatio)
  };
}

function loadInitialTree(requiredPanels = ["problem", "editor", "result"]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.type === "split" || parsed.type === "panel")) {
        const present = collectPanelIds(parsed);
        const allPresent = requiredPanels.every((p) => present.has(p));
        if (allPresent) {
          return cloneTree(parsed);
        }
      }
    }
  } catch (err) {
    console.warn("[WorkspaceLayout] Storage parse notice:", err);
  }
  return cloneTree(WORKSPACE_PRESETS.default.tree);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function WorkspaceLayout({
  panels = {}, // { [panelId]: { title, icon: Icon, renderContent, renderHeaderActions } }
  headerLeft = null,
  onResetLayout = null
}) {
  const { isLight } = useTheme();
  const requiredPanelIds = useMemo(() => Object.keys(panels), [panels]);

  const [layoutTree, setLayoutTree] = useState(() => loadInitialTree(requiredPanelIds));
  const [maximizedPanelId, setMaximizedPanelId] = useState(null);
  const [activeDragPanel, setActiveDragPanel] = useState(null);
  const [hoveredDropTarget, setHoveredDropTarget] = useState(null); // { targetId, zone }
  const [activeResizer, setActiveResizer] = useState(null); // { splitId, direction, startPos, startRatio, containerRect }

  const workspaceRef = useRef(null);
  const containerRef = useRef(null);

  // Trigger resize event on layout changes to let Monaco / CodeMirror re-layout
  const triggerResizeNotification = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("resize"));
    }
  }, []);

  // Save layout tree to localStorage
  const persistTree = useCallback((nextTree) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTree));
    } catch {}
    triggerResizeNotification();
  }, [triggerResizeNotification]);

  // Set tree with persistence
  const updateLayoutTree = useCallback((updater) => {
    setLayoutTree((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistTree(next);
      return next;
    });
  }, [persistTree]);

  // Reset to default
  const handleReset = useCallback(() => {
    setMaximizedPanelId(null);
    const def = cloneTree(WORKSPACE_PRESETS.default.tree);
    updateLayoutTree(def);
    if (onResetLayout) onResetLayout();
  }, [updateLayoutTree, onResetLayout]);

  // Apply preset
  const handleApplyPreset = useCallback((presetKey) => {
    setMaximizedPanelId(null);
    const preset = WORKSPACE_PRESETS[presetKey];
    if (preset) {
      updateLayoutTree(cloneTree(preset.tree));
    }
  }, [updateLayoutTree]);

  // -------------------------------------------------------------------------
  // Resizing System (Pointer Events + Global Listeners)
  // -------------------------------------------------------------------------
  const handleResizerPointerDown = useCallback((e, splitId, direction, splitBoxElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!splitBoxElement) return;
    const rect = splitBoxElement.getBoundingClientRect();

    const startPos = direction === "horizontal" ? e.clientX : e.clientY;
    setActiveResizer({
      splitId,
      direction,
      startPos,
      rect,
      splitBoxElement
    });
  }, []);

  useEffect(() => {
    if (!activeResizer) return;

    function handlePointerMove(e) {
      if (!activeResizer) return;
      const { splitId, direction, rect } = activeResizer;

      let nextRatio = 0.5;
      if (direction === "horizontal") {
        if (!rect.width) return;
        const offset = e.clientX - rect.left;
        nextRatio = Math.min(0.85, Math.max(0.15, offset / rect.width));
      } else {
        if (!rect.height) return;
        const offset = e.clientY - rect.top;
        nextRatio = Math.min(0.85, Math.max(0.15, offset / rect.height));
      }

      setLayoutTree((current) => updateSplitRatioInTree(current, splitId, nextRatio));
      triggerResizeNotification();
    }

    function handlePointerUp() {
      if (activeResizer) {
        persistTree(layoutTree);
        setActiveResizer(null);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [activeResizer, layoutTree, persistTree, triggerResizeNotification]);

  // -------------------------------------------------------------------------
  // Drag & Drop Repositioning System
  // -------------------------------------------------------------------------
  const handleDragStart = useCallback((e, panelId) => {
    // Only initiate drag if left mouse click
    if (e.button !== 0) return;
    setActiveDragPanel(panelId);
    setHoveredDropTarget(null);
  }, []);

  const handleDrop = useCallback((targetPanelId, zone) => {
    if (!activeDragPanel || !targetPanelId || !zone) {
      setActiveDragPanel(null);
      setHoveredDropTarget(null);
      return;
    }

    if (activeDragPanel === targetPanelId) {
      setActiveDragPanel(null);
      setHoveredDropTarget(null);
      return;
    }

    updateLayoutTree((prev) => {
      if (zone === "swap") {
        return swapPanelsInTree(prev, activeDragPanel, targetPanelId);
      }
      // Remove source panel first
      const treeWithoutSource = removePanelFromTree(prev, activeDragPanel);
      // Insert source panel relative to target
      return insertPanelIntoTree(treeWithoutSource, targetPanelId, zone, activeDragPanel);
    });

    setActiveDragPanel(null);
    setHoveredDropTarget(null);
  }, [activeDragPanel, updateLayoutTree]);

  // Cancel dragging on escape or global mouseup outside
  useEffect(() => {
    if (!activeDragPanel) return;

    function handleGlobalMouseUp() {
      setActiveDragPanel(null);
      setHoveredDropTarget(null);
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setActiveDragPanel(null);
        setHoveredDropTarget(null);
      }
    }

    window.addEventListener("pointerup", handleGlobalMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerup", handleGlobalMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDragPanel]);

  // -------------------------------------------------------------------------
  // Recursive Node Renderer
  // -------------------------------------------------------------------------
  const renderNode = useCallback((node) => {
    if (!node) return null;

    // 1. LEAF PANEL
    if (node.type === "panel") {
      const panelConfig = panels[node.panelId] || {};
      const Icon = panelConfig.icon || Layout;
      const title = panelConfig.title || node.panelId;
      const isDraggingThis = activeDragPanel === node.panelId;
      const isOtherDragging = Boolean(activeDragPanel && activeDragPanel !== node.panelId);

      return (
        <div
          key={node.panelId}
          className={`workspace-panel${isDraggingThis ? " is-dragged" : ""}`}
          data-panel-id={node.panelId}
        >
          {/* Header Bar */}
          <div className="workspace-panel-header">
            {/* Left Title + Drag Handle */}
            <div
              className="workspace-panel-title-wrap"
              onPointerDown={(e) => handleDragStart(e, node.panelId)}
              title="Drag to reposition panel into any split or location"
            >
              <span className="workspace-panel-drag-handle">
                <GripVertical size={15} />
              </span>
              <Icon size={15} style={{ color: "var(--ws-accent)", flexShrink: 0 }} />
              <span className="workspace-panel-title">{title}</span>
            </div>

            {/* Right Panel Actions */}
            <div className="workspace-panel-actions">
              {panelConfig.renderHeaderActions && panelConfig.renderHeaderActions()}
              <button
                type="button"
                className="workspace-panel-btn"
                onClick={() => setMaximizedPanelId(maximizedPanelId === node.panelId ? null : node.panelId)}
                title={maximizedPanelId === node.panelId ? "Restore split view" : "Maximize panel"}
              >
                {maximizedPanelId === node.panelId ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {/* Panel Main Content Area */}
          <div className="workspace-panel-content">
            {panelConfig.renderContent ? panelConfig.renderContent() : null}
          </div>

          {/* Drop Zone Overlay (Visible when another panel is being dragged) */}
          {isOtherDragging && (
            <div className="workspace-dropzone-overlay">
              {/* TOP ZONE */}
              <div
                className={`workspace-dropzone-target zone-top${
                  hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "top" ? " is-hovered" : ""
                }`}
                onPointerEnter={() => setHoveredDropTarget({ targetId: node.panelId, zone: "top" })}
                onPointerLeave={() => setHoveredDropTarget(null)}
                onPointerUp={() => handleDrop(node.panelId, "top")}
              >
                {hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "top" && (
                  <span className="workspace-dropzone-hint">
                    <PanelTop size={13} /> Dock Above {title}
                  </span>
                )}
              </div>

              {/* LEFT ZONE */}
              <div
                className={`workspace-dropzone-target zone-left${
                  hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "left" ? " is-hovered" : ""
                }`}
                onPointerEnter={() => setHoveredDropTarget({ targetId: node.panelId, zone: "left" })}
                onPointerLeave={() => setHoveredDropTarget(null)}
                onPointerUp={() => handleDrop(node.panelId, "left")}
              >
                {hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "left" && (
                  <span className="workspace-dropzone-hint">
                    <PanelLeft size={13} /> Dock Left of {title}
                  </span>
                )}
              </div>

              {/* CENTER / SWAP ZONE */}
              <div
                className={`workspace-dropzone-target zone-center${
                  hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "swap" ? " is-hovered" : ""
                }`}
                onPointerEnter={() => setHoveredDropTarget({ targetId: node.panelId, zone: "swap" })}
                onPointerLeave={() => setHoveredDropTarget(null)}
                onPointerUp={() => handleDrop(node.panelId, "swap")}
              >
                {hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "swap" && (
                  <span className="workspace-dropzone-hint">
                    <RotateCcw size={13} /> Swap with {title}
                  </span>
                )}
              </div>

              {/* RIGHT ZONE */}
              <div
                className={`workspace-dropzone-target zone-right${
                  hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "right" ? " is-hovered" : ""
                }`}
                onPointerEnter={() => setHoveredDropTarget({ targetId: node.panelId, zone: "right" })}
                onPointerLeave={() => setHoveredDropTarget(null)}
                onPointerUp={() => handleDrop(node.panelId, "right")}
              >
                {hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "right" && (
                  <span className="workspace-dropzone-hint">
                    <PanelLeft size={13} style={{ transform: "scaleX(-1)" }} /> Dock Right of {title}
                  </span>
                )}
              </div>

              {/* BOTTOM ZONE */}
              <div
                className={`workspace-dropzone-target zone-bottom${
                  hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "bottom" ? " is-hovered" : ""
                }`}
                onPointerEnter={() => setHoveredDropTarget({ targetId: node.panelId, zone: "bottom" })}
                onPointerLeave={() => setHoveredDropTarget(null)}
                onPointerUp={() => handleDrop(node.panelId, "bottom")}
              >
                {hoveredDropTarget?.targetId === node.panelId && hoveredDropTarget?.zone === "bottom" && (
                  <span className="workspace-dropzone-hint">
                    <PanelTop size={13} style={{ transform: "scaleY(-1)" }} /> Dock Below {title}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    // 2. SPLIT CONTAINER NODE
    const direction = node.direction || "horizontal";
    const ratio = typeof node.splitRatio === "number" ? node.splitRatio : 0.5;
    const isResizingThis = activeResizer?.splitId === node.id;

    return (
      <SplitBox
        key={node.id}
        node={node}
        direction={direction}
        ratio={ratio}
        isResizingThis={isResizingThis}
        onResizerPointerDown={handleResizerPointerDown}
        renderFirst={() => renderNode(node.first)}
        renderSecond={() => renderNode(node.second)}
      />
    );
  }, [
    panels,
    activeDragPanel,
    hoveredDropTarget,
    maximizedPanelId,
    activeResizer,
    handleDragStart,
    handleDrop,
    handleResizerPointerDown
  ]);

  // -------------------------------------------------------------------------
  // Maximized Panel View
  // -------------------------------------------------------------------------
  const renderMaximizedView = () => {
    if (!maximizedPanelId) return null;
    const panelConfig = panels[maximizedPanelId] || {};
    const Icon = panelConfig.icon || Layout;
    const title = panelConfig.title || maximizedPanelId;

    return (
      <div className="workspace-panel workspace-maximized-panel">
        <div className="workspace-panel-header">
          <div className="workspace-panel-title-wrap">
            <Icon size={16} style={{ color: "var(--ws-accent)" }} />
            <span className="workspace-panel-title">{title} (Maximized)</span>
          </div>
          <div className="workspace-panel-actions">
            {panelConfig.renderHeaderActions && panelConfig.renderHeaderActions()}
            <button
              type="button"
              className="workspace-tool-btn"
              onClick={() => setMaximizedPanelId(null)}
              style={{ background: "var(--ws-dropzone-bg)", borderColor: "var(--ws-dropzone-border)", color: "var(--ws-dropzone-text)" }}
            >
              <Minimize2 size={13} /> Exit Full View
            </button>
          </div>
        </div>
        <div className="workspace-panel-content">
          {panelConfig.renderContent ? panelConfig.renderContent() : null}
        </div>
      </div>
    );
  };

  return (
    <div className="workspace-root" ref={workspaceRef}>
      {/* Workspace Controls Toolbar */}
      <div className="workspace-toolbar">
        <div className="workspace-toolbar-left">
          {headerLeft}
        </div>

        <div className="workspace-toolbar-right">
          {/* Quick Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", background: isLight ? "#f1f5f9" : "rgba(255,255,255,0.04)", padding: "2px", borderRadius: "8px", border: "1px solid var(--ws-border)" }}>
            <button
              type="button"
              onClick={() => handleApplyPreset("default")}
              className="workspace-preset-pill"
              title="Standard Online Judge Layout (Problem Left, Editor Top-Right, Result Bottom-Right)"
            >
              <Layout size={13} /> Standard
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("threeColumn")}
              className="workspace-preset-pill"
              title="3-Column Layout (Problem | Editor | Result)"
            >
              <Columns size={13} /> 3-Column
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset("stacked")}
              className="workspace-preset-pill"
              title="Stacked Vertical Layout (Editor / Result / Problem)"
            >
              <Rows size={13} /> Stacked
            </button>
          </div>

          {/* Reset Layout Button */}
          <button
            type="button"
            onClick={handleReset}
            className="workspace-tool-btn"
            title="Reset workspace panels to default layout and sizes"
          >
            <RotateCcw size={13} /> Reset Layout
          </button>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div
        ref={containerRef}
        className={`workspace-container${
          activeResizer
            ? activeResizer.direction === "horizontal"
              ? " is-resizing is-resizing-h"
              : " is-resizing is-resizing-v"
            : ""
        }`}
      >
        {maximizedPanelId ? renderMaximizedView() : renderNode(layoutTree)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Split Box Component (Handles First, Splitter, Second layout)
// ---------------------------------------------------------------------------
function SplitBox({
  node,
  direction,
  ratio,
  isResizingThis,
  onResizerPointerDown,
  renderFirst,
  renderSecond
}) {
  const splitBoxRef = useRef(null);

  const firstStyle = useMemo(() => {
    const pct = Math.round(ratio * 10000) / 100;
    if (direction === "horizontal") {
      return { width: `calc(${pct}% - 4px)`, flexShrink: 0 };
    }
    return { height: `calc(${pct}% - 4px)`, flexShrink: 0 };
  }, [direction, ratio]);

  return (
    <div
      ref={splitBoxRef}
      className={`workspace-split-box ${direction}`}
      data-split-id={node.id}
    >
      {/* First Pane */}
      <div className="workspace-split-first" style={firstStyle}>
        {renderFirst()}
      </div>

      {/* Draggable Divider Splitter */}
      <div
        className={`workspace-splitter ${direction}${isResizingThis ? " is-active" : ""}`}
        onPointerDown={(e) => onResizerPointerDown(e, node.id, direction, splitBoxRef.current)}
        title={`Drag to resize ${direction === "horizontal" ? "columns" : "rows"}`}
      >
        <span className="workspace-splitter-handle">
          {direction === "horizontal" ? <GripVertical size={11} /> : <GripHorizontal size={11} />}
        </span>
      </div>

      {/* Second Pane */}
      <div className="workspace-split-second">
        {renderSecond()}
      </div>
    </div>
  );
}

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ChatDockContext = createContext(null);

const PANEL_WIDTH_REM = 24;
const PANEL_GAP_REM = 1.5;
const PANEL_BASE_LEFT_REM = 6;
const PANEL_BASE_BOTTOM_REM = 1.5;

const BUBBLE_SIZE_REM = 4;
const BUBBLE_GAP_REM = 0.75;
const BUBBLE_BASE_BOTTOM_REM = 1.5;

const DEFAULT_BUBBLE_ORDER = ['support', 'ai'];

const ChatDockProvider = ({ children }) => {
  const [openPanels, setOpenPanels] = useState([]);

  const registerPanel = useCallback((id) => {
    setOpenPanels((prev) => {
      const next = prev.filter((panelId) => panelId !== id);
      next.unshift(id);
      return next;
    });
  }, []);

  const unregisterPanel = useCallback((id) => {
    setOpenPanels((prev) => prev.filter((panelId) => panelId !== id));
  }, []);

  const getPanelLeftOffset = useCallback((id) => {
    const index = openPanels.indexOf(id);
    if (index === -1) {
      return PANEL_BASE_LEFT_REM;
    }
    return PANEL_BASE_LEFT_REM + index * (PANEL_WIDTH_REM + PANEL_GAP_REM);
  }, [openPanels]);

  const getBubbleBottomOffset = useCallback((id) => {
    const index = DEFAULT_BUBBLE_ORDER.indexOf(id);
    if (index === -1) {
      return BUBBLE_BASE_BOTTOM_REM;
    }
    return BUBBLE_BASE_BOTTOM_REM + index * (BUBBLE_SIZE_REM + BUBBLE_GAP_REM);
  }, []);

  const getPanelBottomOffset = useCallback(() => PANEL_BASE_BOTTOM_REM, []);

  const value = useMemo(() => ({
    registerPanel,
    unregisterPanel,
    getPanelLeftOffset,
    getBubbleBottomOffset,
    getPanelBottomOffset
  }), [registerPanel, unregisterPanel, getPanelLeftOffset, getBubbleBottomOffset, getPanelBottomOffset]);

  return (
    <ChatDockContext.Provider value={value}>
      {children}
    </ChatDockContext.Provider>
  );
};

const useChatDock = () => {
  const context = useContext(ChatDockContext);
  if (!context) {
    throw new Error('useChatDock must be used within ChatDockProvider');
  }
  return context;
};

export { ChatDockProvider, useChatDock };

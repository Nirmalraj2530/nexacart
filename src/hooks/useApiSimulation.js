"use client";

import React, { createContext, useContext, useState } from "react";

const ApiSimulationContext = createContext(null);

export function ApiSimulationProvider({ children }) {
  const [simulatedDelay, setSimulatedDelay] = useState(0); // in ms
  const [forceApiError, setForceApiError] = useState(false);
  const [forceEmptyData, setForceEmptyData] = useState(false);
  const [useLargeDataset, setUseLargeDataset] = useState(false);

  const value = {
    simulatedDelay,
    setSimulatedDelay,
    forceApiError,
    setForceApiError,
    forceEmptyData,
    setForceEmptyData,
    useLargeDataset,
    setUseLargeDataset,
    resetAll: () => {
      setSimulatedDelay(0);
      setForceApiError(false);
      setForceEmptyData(false);
      setUseLargeDataset(false);
    },
  };

  return (
    <ApiSimulationContext.Provider value={value}>
      {children}
    </ApiSimulationContext.Provider>
  );
}

export function useApiSimulation() {
  const context = useContext(ApiSimulationContext);
  if (!context) {
    return {
      simulatedDelay: 0,
      setSimulatedDelay: () => {},
      forceApiError: false,
      setForceApiError: () => {},
      forceEmptyData: false,
      setForceEmptyData: () => {},
      useLargeDataset: false,
      setUseLargeDataset: () => {},
      resetAll: () => {},
    };
  }
  return context;
}

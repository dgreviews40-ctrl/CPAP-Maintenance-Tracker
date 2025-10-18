"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DataRefreshContextType {
  dataRefreshKey: number;
  refreshData: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const DataRefreshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const refreshData = () => {
    setDataRefreshKey(prev => prev + 1);
  };

  return (
    <DataRefreshContext.Provider value={{ dataRefreshKey, refreshData }}>
      {children}
    </DataRefreshContext.Provider>
  );
};

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error("useDataRefresh must be used within a DataRefreshProvider");
  }
  return context;
};
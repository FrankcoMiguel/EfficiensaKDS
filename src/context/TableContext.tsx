import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Table, Order } from '../types';

interface TableContextType {
  tables: Table[];
  selectedTable: Table | null;
  selectTable: (table: Table) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  addOrderToTable: (tableId: string, order: Order) => void;
  clearTable: (tableId: string) => void;
  addTable: (table: Table) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

// Start with empty tables - to be populated from floor layout
const initialTables: Table[] = [];

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const selectTable = (table: Table) => {
    setSelectedTable(table);
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => 
      prev.map(table => 
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  const addOrderToTable = (tableId: string, order: Order) => {
    setTables(prev => 
      prev.map(table => 
        table.id === tableId 
          ? { ...table, status: 'occupied', order } 
          : table
      )
    );
  };

  const clearTable = (tableId: string) => {
    setTables(prev => 
      prev.map(table => 
        table.id === tableId 
          ? { ...table, status: 'available', order: undefined } 
          : table
      )
    );
  };

  const addTable = (table: Table) => {
    setTables(prev => [...prev, table]);
  };

  return (
    <TableContext.Provider
      value={{
        tables,
        selectedTable,
        selectTable,
        updateTableStatus,
        addOrderToTable,
        clearTable,
        addTable,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTables must be used within a TableProvider');
  }
  return context;
};
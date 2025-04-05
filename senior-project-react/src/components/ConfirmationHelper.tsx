import React, { createContext, useContext, useState } from "react";

interface ConfirmationContextType {
  open: boolean;
  toggleOpen: () => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: {children: React.ReactNode}) {
  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = () => {
    setOpen(!open);
  }

  return (
    <ConfirmationContext.Provider value={{ open, toggleOpen }}>
      {children}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation(): ConfirmationContextType {
  const context = useContext(ConfirmationContext);
  if(context === undefined) {
    throw new Error();
  }
  return context;
}
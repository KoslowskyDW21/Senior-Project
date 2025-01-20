//this class creates a context / data structure to store data that persists
//between different pages
import React, { createContext, useContext, useState } from "react";

export enum Floor {
  One = 1,
  Two = 2,
  Three = 3,
  Four = 4,
}

export enum Side {
  Mens = "Men's",
  Womens = "Women's",
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  floor: Floor;
  side: Side;
  profilePicture: File | null;
}

const defaultData: RegistrationData = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  floor: Floor.One,
  side: Side.Mens,
  profilePicture: null,
};

const RegistrationContext = createContext({
  data: defaultData,
  setData: (data: RegistrationData) => {},
});

export const useRegistration = () => useContext(RegistrationContext);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState(defaultData);

  return (
    <RegistrationContext.Provider value={{ data, setData }}>
      {children}
    </RegistrationContext.Provider>
  );
};

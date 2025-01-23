//this class creates a context / data structure to store data that persists
//between different pages
import React, { createContext, useContext, useState } from "react";

export enum Floor {
  One = "1",
  Two = "2",
  Three = "3",
  Four = "4",
  None = "",
  ADMIN = "ADMIN",
}

export enum Side {
  Mens = "Mens",
  Womens = "Womens",
  None = "",
  ADMIN = "ADMIN",
}

interface RegistrationData {
  fname: string;
  lname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  colonial_floor: Floor;
  colonial_side: Side;
  profile_picture: File | null;
  profile_picture_text: string;
}

const defaultData: RegistrationData = {
  fname: "",
  lname: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  colonial_floor: Floor.None,
  colonial_side: Side.None,
  profile_picture: null,
  profile_picture_text: "",
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

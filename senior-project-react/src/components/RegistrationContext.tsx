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
  dietaryRestrictions: DietaryRestrictions;
}

interface DietaryRestrictions {
  Wheat: Boolean; //wheat
  Dairy: Boolean; //dairy
  Egg: Boolean; //egg
  Fish: Boolean; //fish
  Pork: Boolean; //pork
  Shellfish: Boolean; //shellfish
  Soy: Boolean; //soy
  Treenut: Boolean; //treenut
  Peanut: Boolean; //peanut
  Sesame: Boolean; //sesame
  Vegan: Boolean; //vegan
  Vegetarian: Boolean; //vegetarian
}

const defaultDietaryRestrictions: DietaryRestrictions = {
  Wheat: false,
  Dairy: false,
  Egg: false,
  Fish: false,
  Pork: false,
  Shellfish: false,
  Soy: false,
  Treenut: false,
  Peanut: false,
  Sesame: false,
  Vegan: false,
  Vegetarian: false,
};

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
  dietaryRestrictions: defaultDietaryRestrictions,
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

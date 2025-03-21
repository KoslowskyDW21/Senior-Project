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
  colonial_floor: Floor;
  colonial_side: Side;
  profile_picture: File | null;
  profile_picture_text: string;
  dietaryRestrictions: DietaryRestrictions;
  cuisines: Cuisines;
}

interface DietaryRestrictions {
  Wheat: Boolean; 
  Dairy: Boolean; 
  Egg: Boolean; 
  Fish: Boolean; 
  Pork: Boolean; 
  Shellfish: Boolean; 
  Soy: Boolean; 
  Treenut: Boolean; 
  Peanut: Boolean; 
  Sesame: Boolean; 
  Vegan: Boolean; 
  Vegetarian: Boolean; 
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
//TODO: This may have to be refactored once we update cuisine values
interface Cuisines {
  British: Boolean;
  Malaysian: Boolean;
  Indian: Boolean;
  American: Boolean;
  Mexican: Boolean;
  Russian: Boolean;
  French: Boolean;
  Canadian: Boolean;
  Jamaican: Boolean;
  Chinese: Boolean;
  Italian: Boolean;
  Dutch: Boolean;
  Vietnamese: Boolean;
  Polish: Boolean;
  Irish: Boolean;
  Croatian: Boolean;
  Filipino: Boolean;
  Ukrainian: Boolean;
  Unknown: Boolean;
  Japanese: Boolean;
  Moroccan: Boolean;
  Turkish: Boolean;
  Greek: Boolean;
  Egyptian: Boolean;
  Portuguese: Boolean;
  Kenyan: Boolean;
  Thai: Boolean;
  Spanish: Boolean;
}

const defaultCusines: Cuisines = {
  British: false,
  Malaysian: false,
  Indian: false,
  American: false,
  Mexican: false,
  Russian: false,
  French: false,
  Canadian: false,
  Jamaican: false,
  Chinese: false,
  Italian: false,
  Dutch: false,
  Vietnamese: false,
  Polish: false,
  Irish: false,
  Croatian: false,
  Filipino: false,
  Ukrainian: false,
  Unknown: false,
  Japanese: false,
  Moroccan: false,
  Turkish: false,
  Greek: false,
  Egyptian: false,
  Portuguese: false,
  Kenyan: false,
  Thai: false,
  Spanish: false,
};

const defaultData: RegistrationData = {
  fname: "",
  lname: "",
  username: "",
  email: "",
  colonial_floor: Floor.None,
  colonial_side: Side.None,
  profile_picture: null,
  profile_picture_text: "",
  dietaryRestrictions: defaultDietaryRestrictions,
  cuisines: defaultCusines,
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

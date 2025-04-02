import React, { useState, createContext, useContext } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
// import confirmationMessageOpen from "./ConfirmationHelper";

// export const [messageOpen, setMessageOpen] = useState<boolean>(true);
// export let confirmation: boolean = false;
// export function setConfirmation(open: boolean) {
//   confirmation = open;
// }

export const ConfirmationContext = createContext(false);

export default function ConfirmationMessage({ message }: {message: String;}) {
  const temp = useContext(ConfirmationContext)
  const [open, setOpen] = useState<boolean>(temp);

  const handleClose = () => setOpen(false);

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

  return (
    <ConfirmationContext.Provider value={open}>
      <Snackbar
        open={temp}
        autoHideDuration={6000}
        onClose={handleClose}
        message={message}
        action={action}
      />
    </ConfirmationContext.Provider>
  );
}
import React, { useState, createContext, useContext } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import { useConfirmation } from "./ConfirmationHelper";
// import confirmationMessageOpen from "./ConfirmationHelper";

// export const [messageOpen, setMessageOpen] = useState<boolean>(true);
// export let confirmation: boolean = false;
// export function setConfirmation(open: boolean) {
//   confirmation = open;
// }

// export const ConfirmationContext = createContext(false);



export default function ConfirmationMessage({ message }: {message: String;}) {
  // const temp = useContext(ConfirmationContext)
  // const [open, setOpen] = useState<boolean>(temp);
  const { open, toggleOpen } = useConfirmation();

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={toggleOpen}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  )

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={toggleOpen}
      message={message}
      action={action}
    />
  );
}
import React, { useState, createContext, useContext } from "react";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Snackbar from "@mui/material/Snackbar";
import { useConfirmation } from "./ConfirmationHelper";

export default function ConfirmationMessage({ message }: {message: String;}) {
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
      onClose={() => {
        if(open) {
          toggleOpen();
        }
      }}
      message={message}
      action={action}
    />
  );
}